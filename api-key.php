<?php
// This file stores the API key securely
// In a production environment, this should be kept outside the web root
// or use environment variables instead

// Gemini API key
$api_key = "API";

// Function to get the API key
function getGeminiApiKey() {
    global $api_key;
    return $api_key;
}
?>
