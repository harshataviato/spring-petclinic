const express = require('express');
const router = express.Router();

/**
 * Handles the home page request.
 */
router.get('/', (req, res) => {
    res.render('welcome');
});

module.exports = router;
