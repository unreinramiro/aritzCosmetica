namespace Aritz.Server.Services
{
    public static class EmailTemplates
    {
        private const string Primary = "#A8B5A0"; // color principal de tu web
        private const string Accent = "#6B7F66"; // color de botones/acentos
        private const string Bg = "#F2F5EF";

        public static string Layout(string title, string contentHtml) => $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
</head>
<body style=""margin:0;padding:0;background:{Bg};font-family:Arial,Helvetica,sans-serif;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:{Bg};padding:24px 0;"">
    <tr><td align=""center"">
      <table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" style=""max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;"">
        <tr>
          <td style=""background:{Primary};padding:24px;text-align:center;"">
            <span style=""color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:2px;font-family:Montserrat"">Aritz</span>
          </td>
        </tr>
        <tr>
          <td style=""padding:32px 24px;color:#333333;font-size:16px;line-height:1.5;"">
            <h1 style=""margin:0 0 16px;font-size:22px;color:{Primary};"">{title}</h1>
            {contentHtml}
          </td>
        </tr>
        <tr>
          <td style=""background:#fafafa;padding:16px;text-align:center;font-size:12px;color:#888888;"">
            © {DateTime.Now.Year} Aritz. All Rights Reserved.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

        public static string Button(string text, string url) => $@"
<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:24px 0;"">
  <tr><td style=""background:{Accent};border-radius:6px;"">
    <a href=""{url}"" style=""display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;"">{text}</a>
  </td></tr>
</table>";

        public static string Notice(string text) => $@"
<div style=""background:#fff8e1;border-left:4px solid {Accent};padding:12px 16px;margin:16px 0;font-size:14px;"">{text}</div>";
    }
}