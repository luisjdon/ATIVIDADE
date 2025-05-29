<?php
// This file stores the API key securely
// In a production environment, this should be kept outside the web root
// or use environment variables instead

// Gemini API key
$api_key = "AIzaSyAhtSTUL7Rz5ex1D_fEA6Gg77FiiBOdQDw";

// Function to get the API key
function getGeminiApiKey() {
    global $api_key;
    return $api_key;
}
?>
