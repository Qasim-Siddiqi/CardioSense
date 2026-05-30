using Resend;

namespace CardioSense.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IResend _resend;

        public EmailService(IResend resend)
        {
            _resend = resend;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            var message = new EmailMessage();
            message.From = "onboarding@resend.dev";
            message.To.Add(to);
            message.Subject = subject;
            message.TextBody = body;

            await _resend.EmailSendAsync(message);
        }
    }
}