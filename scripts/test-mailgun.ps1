# Test Mailgun API directly
$apiKey = "key-ef4db25b63a151050975edb88cdf5c09-235e4bb2-1d5ac8af"
$domain = "mg.estatenews.dk"
$url = "https://api.eu.mailgun.net/v3/$domain/messages"

Write-Host "Testing Mailgun API..."
Write-Host "Domain: $domain"
Write-Host "API Key: $($apiKey.Substring(0, 15))..."
Write-Host ""

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

$headers = @{
    Authorization = "Basic $base64"
}

$body = @{
    from = "Estate News <noreply@$domain>"
    to = "ek@digitaldisruptionmedia.com"
    subject = "Test Email from Mailgun"
    text = "This is a test email to verify Mailgun integration."
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    Write-Host "✓ Email sent successfully!"
    Write-Host $response
} catch {
    Write-Host "✗ Failed to send email"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    $_.Exception | Format-List -Force
}
