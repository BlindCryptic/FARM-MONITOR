function sendAlertEmail(message) {
    // Make sure you've initialized EmailJS with your actual user ID
    emailjs.send("your_service_id", "your_template_id", {
        to_name: userDisplayName.textContent,
        message: message
    }).then(response => {
        console.log("Email sent:", response.status, response.text);
        
        // Log the alert to Firebase
        database.ref('alerts').push({
            message: message,
            timestamp: new Date().toISOString() // Add a timestamp for the alert
        });
    }, error => {
        console.error("Email failed:", error);
    });
}
