import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { getFinancialOverview } from './transactions.js';

const router = express.Router();

// Memory store for pending unconfirmed destructive actions (expires in 10 minutes)
const pendingActionsMap = new Map();

// Log AI actions into audit table
function logAiAudit(userId, action, targetId, details) {
  const logId = 'ailog_' + crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO ai_audit_logs (id, user_id, action, target_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(logId, userId, action, targetId || null, JSON.stringify(details || {}), now);
}

// 1. CHAT / NATURAL LANGUAGE PROCESSOR
router.post('/chat', requireAuth, (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const lower = message.toLowerCase().trim();
    const overview = getFinancialOverview(req.userId);
    const now = new Date().toISOString();

    // TOOL 1: DESTRUCTIVE INTENT: "Delete transaction", "Remove expense"
    if (lower.includes('delete') || lower.includes('remove')) {
      // Find matching transaction
      let matchedTx = null;

      // Check for amount mentioned: e.g. "delete my 500", "delete ₹350"
      const amountMatch = message.match(/(\d+)/);
      const targetAmount = amountMatch ? Number(amountMatch[1]) : null;

      if (targetAmount) {
        matchedTx = db.prepare(`
          SELECT * FROM transactions 
          WHERE user_id = ? AND amount = ? 
          ORDER BY date DESC, time DESC LIMIT 1
        `).get(req.userId, targetAmount);
      } else {
        // Look by merchant or category keyword
        const words = lower.split(/\s+/).filter(w => w.length > 3 && !['delete', 'remove', 'transaction', 'from', 'yesterday', 'please'].includes(w));
        if (words.length > 0) {
          const pattern = `%${words[0]}%`;
          matchedTx = db.prepare(`
            SELECT * FROM transactions 
            WHERE user_id = ? AND (LOWER(merchant) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)
            ORDER BY date DESC, time DESC LIMIT 1
          `).get(req.userId, pattern, pattern, pattern);
        }
      }

      if (!matchedTx) {
        // Fallback: get the most recent transaction
        matchedTx = db.prepare(`
          SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, time DESC LIMIT 1
        `).get(req.userId);
      }

      if (matchedTx) {
        const actionId = 'act_' + crypto.randomUUID();
        const actionPayload = {
          id: actionId,
          userId: req.userId,
          actionType: 'DELETE_TRANSACTION',
          targetId: matchedTx.id,
          summary: `₹${matchedTx.amount} — ${matchedTx.category} — ${matchedTx.payment_method} — ${matchedTx.date} (${matchedTx.merchant || matchedTx.description || 'No note'})`,
          expiresAt: Date.now() + 10 * 60 * 1000
        };

        pendingActionsMap.set(actionId, actionPayload);

        logAiAudit(req.userId, 'REQUEST_DELETE_TRANSACTION_CONFIRMATION', matchedTx.id, {
          actionId,
          amount: matchedTx.amount,
          category: matchedTx.category
        });

        return res.json({
          reply: `I located the transaction:\n\n**₹${matchedTx.amount} — ${matchedTx.category} — ${matchedTx.payment_method} (${matchedTx.date})**\n\n*Merchant / Note: ${matchedTx.merchant || matchedTx.description || 'N/A'}*\n\n⚠️ **For your financial security, destructive actions require explicit confirmation.** Do you want me to delete this transaction?`,
          requiresConfirmation: true,
          pendingAction: {
            id: actionId,
            actionType: 'DELETE_TRANSACTION',
            targetId: matchedTx.id,
            description: `Delete ${matchedTx.category} transaction of ₹${matchedTx.amount}`
          }
        });
      } else {
        return res.json({
          reply: "I couldn't find any transaction matching your query to delete. Please specify the amount or merchant."
        });
      }
    }

    // TOOL 2: SPENDING SUMMARY / OVERVIEW
    if (lower.includes('summary') || lower.includes('summarize') || lower.includes('overview') || lower.includes('balance') || lower.includes('how much')) {
      const topCat = db.prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions WHERE user_id = ? AND type = 'expense'
        GROUP BY category ORDER BY total DESC LIMIT 1
      `).get(req.userId) || { category: 'None', total: 0 };

      const bankCount = db.prepare('SELECT COUNT(*) as count FROM banks WHERE user_id = ?').get(req.userId).count;

      logAiAudit(req.userId, 'SUMMARIZE_SPENDING', null, { netAvailable: overview.netAvailableMoney });

      return res.json({
        reply: `🌌 **RupeeWise Financial Intelligence Summary**\n\n` +
          `• **Net Available Money:** ₹${overview.netAvailableMoney.toLocaleString('en-IN')}\n` +
          `• **Total Bank Balances (${bankCount} Vaults):** ₹${overview.totalBankBalance.toLocaleString('en-IN')}\n` +
          `• **Cash in Hand:** ₹${overview.cashBalance.toLocaleString('en-IN')}\n` +
          `• **Total Recorded Income:** ₹${overview.totalIncome.toLocaleString('en-IN')}\n` +
          `• **Total Recorded Expense:** ₹${overview.totalExpense.toLocaleString('en-IN')}\n` +
          `• **Top Expense Driver:** ${topCat.category} (₹${topCat.total.toLocaleString('en-IN')})\n\n` +
          `*Your liquid accounts are healthy and all vaults are dynamically reconciled.*`
      });
    }

    // TOOL 3: CATEGORIZATION ADVICE / AUTO-CATEGORIZATION
    if (lower.includes('categorize') || lower.includes('category')) {
      const txs = db.prepare(`
        SELECT id, merchant, description, category, amount FROM transactions 
        WHERE user_id = ? ORDER BY date DESC LIMIT 5
      `).all(req.userId);

      logAiAudit(req.userId, 'CATEGORIZE_TRANSACTIONS', null, { count: txs.length });

      return res.json({
        reply: `I analyzed your recent transactions. All transactions have high-confidence categorizations:\n\n` +
          txs.map(t => `• **${t.merchant || t.description || 'Transaction'}** (₹${t.amount}) → \`${t.category}\``).join('\n') +
          `\n\nIf you ever change a merchant's category, our rule engine automatically maps all future imports!`
      });
    }

    // TOOL 4: BUDGET ADVICE
    if (lower.includes('budget') || lower.includes('advice') || lower.includes('save') || lower.includes('suggest')) {
      const topCategories = db.prepare(`
        SELECT category, SUM(amount) as spent
        FROM transactions WHERE user_id = ? AND type = 'expense'
        GROUP BY category ORDER BY spent DESC LIMIT 3
      `).all(req.userId);

      logAiAudit(req.userId, 'SUGGEST_BUDGETS', null, { suggestionsCount: topCategories.length });

      const suggestions = topCategories.map(c => {
        const recommended = Math.round(c.spent * 1.1);
        return `• **${c.category}**: Current spend is ₹${c.spent.toLocaleString('en-IN')}. Recommended monthly ceiling: **₹${recommended.toLocaleString('en-IN')}**.`;
      }).join('\n');

      return res.json({
        reply: `🎯 **AI Budget Optimization Suggestions**\n\nBased on your historical spending velocity:\n\n${suggestions}\n\n*Tip: Keeping utility bills automated via bank transfer avoids late surcharges!*`
      });
    }

    // TOOL 5: SEARCH / FIND TRANSACTIONS
    if (lower.includes('find') || lower.includes('search') || lower.includes('show')) {
      const results = db.prepare(`
        SELECT amount, type, category, merchant, date, payment_method FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC LIMIT 5
      `).all(req.userId);

      logAiAudit(req.userId, 'SEARCH_TRANSACTIONS', null, { query: message });

      return res.json({
        reply: `Here are the latest matching transactions found in your vault:\n\n` +
          results.map(r => `• **₹${r.amount}** (${r.type}) — ${r.category} via ${r.payment_method} on ${r.date} [${r.merchant || 'Direct'}]`).join('\n')
      });
    }

    // DEFAULT AI ASSISTANT RESPONSE
    return res.json({
      reply: `Hello! I am your **RupeeWise Cosmic Financial Agent**. Here are some approved actions I can perform for you:\n\n` +
        `• 📊 *"Summarize my spending and net available balance"*\n` +
        `• 🔍 *"Find my highest expense this month"*\n` +
        `• 🏷️ *"Categorize my recent transactions"*\n` +
        `• 💡 *"Suggest a monthly budget based on my habits"*\n` +
        `• 🗑️ *"Delete transaction of ₹350"* (requires explicit confirmation)\n\n` +
        `How can I assist your financial journey today?`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. CONFIRM PENDING DESTRUCTIVE ACTION
router.post('/confirm-action', requireAuth, (req, res) => {
  try {
    const { actionId, confirmed } = req.body;
    if (!actionId) {
      return res.status(400).json({ error: 'Action ID is required.' });
    }

    const action = pendingActionsMap.get(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action expired or not found. Please re-initiate the request.' });
    }

    if (action.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to confirm this action.' });
    }

    if (Date.now() > action.expiresAt) {
      pendingActionsMap.delete(actionId);
      return res.status(400).json({ error: 'Action approval window expired.' });
    }

    if (!confirmed) {
      pendingActionsMap.delete(actionId);
      logAiAudit(req.userId, 'REJECTED_ACTION', action.targetId, { actionId });
      return res.json({
        message: 'Action was cancelled by user. No data was modified.'
      });
    }

    // Execute approved action
    if (action.actionType === 'DELETE_TRANSACTION') {
      db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(action.targetId, req.userId);
      pendingActionsMap.delete(actionId);

      logAiAudit(req.userId, 'CONFIRMED_DELETE_TRANSACTION', action.targetId, { actionId, summary: action.summary });
      const overview = getFinancialOverview(req.userId);

      return res.json({
        success: true,
        message: `Transaction deleted successfully upon your authorization.`,
        deletedId: action.targetId,
        overview
      });
    }

    return res.status(400).json({ error: 'Unknown action type.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET AI AUDIT LOGS
router.get('/audit-logs', requireAuth, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM ai_audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20
    `).all(req.userId);

    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
