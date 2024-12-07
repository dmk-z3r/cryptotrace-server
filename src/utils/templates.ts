export const loginAlertTemplate = (ipAddress: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #e74c3c;">Login Alert</h1>
  <p>Someone has logged into your account from a new IP address:</p>
  <p style="background-color: #f8f8f8; padding: 10px; border-left: 5px solid #e74c3c;"><strong>IP Address:</strong> ${ipAddress}</p>
  <p>If this was you, you can ignore this email. If you didn't log in recently, please change your password immediately and contact support.</p>
</body>
</html>
`;

export const accessRequestTemplate = (name: string, email: string, agency: string, role: string, reason: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Request Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #3498db;">Access Request Received</h1>
  <p>Thank you for requesting access to our product. We have received your request and will review it shortly.</p>
  <h2 style="color: #2c3e50;">Your Request Details:</h2>
  <ul style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
    <li><strong>Name:</strong> ${name}</li>
    <li><strong>Email:</strong> ${email}</li>
    <li><strong>Agency:</strong> ${agency}</li>
    <li><strong>Role:</strong> ${role}</li>
    <li><strong>Reason:</strong> ${reason}</li>
  </ul>
  <p>We'll get back to you as soon as possible with the status of your request.</p>
</body>
</html>
`;

export const newAccessRequestTemplate = (name: string, email: string, agency: string, role: string, reason: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Access Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #27ae60;">New Access Request</h1>
  <p>A new access request has been submitted for review:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tr style="background-color: #f2f2f2;">
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Field</th>
      <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Value</th>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>Name</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>Email</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>Agency</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${agency}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>Role</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${role}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>Reason</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${reason}</td>
    </tr>
  </table>
  <p>Please review this request and take appropriate action.</p>
</body>
</html>
`;

export const accessGrantedTemplate = (name: string, password: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Request Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #27ae60;">Access Request Approved</h1>
  <p>Dear ${name},</p>
  <p>We're pleased to inform you that your access request has been approved!</p>
  <div style="background-color: #f2f2f2; border-left: 5px solid #27ae60; padding: 20px; margin: 20px 0;">
    <p style="margin: 0;">You can now log in to our product using your registered email address and the following password:</p>
    <p style="margin: 10px 0; padding: 10px; background-color: #e9ecef; border-left: 5px solid #3498db;"><strong>Password:</strong> ${password}</p>
  </div>
  <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
  <p>Welcome aboard!</p>
</body>
</html>
`;
