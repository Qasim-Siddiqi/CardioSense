using System.Net;
using System.Net.Mail;

namespace CardioSense.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            var section = _config.GetSection("Email");

            using var client = new SmtpClient(section["Host"], int.Parse(section["Port"]!))
            {
                Credentials = new NetworkCredential(section["Username"], section["Password"]),
                EnableSsl = true
            };

            var message = new MailMessage(section["From"]!, to, subject, body);
            await client.SendMailAsync(message);
        }
    }
}