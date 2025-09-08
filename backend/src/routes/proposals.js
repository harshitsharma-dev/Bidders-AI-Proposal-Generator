// routes/proposals.js
const express = require('express');
const ProposalController = require('../controllers/proposalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, ProposalController.generateProposal);
router.get('/my-proposals', auth, ProposalController.getMyProposals);
router.put('/:id', auth, ProposalController.updateProposal);
router.post('/:id/submit', auth, ProposalController.submitProposal);

module.exports = router;