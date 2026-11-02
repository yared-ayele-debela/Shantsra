<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $campaign->subject }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#f1f5ea; font-family:'Noto Sans', 'Segoe UI', Arial, Helvetica, sans-serif; color:#241b14;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5ea; background-image:linear-gradient(180deg, #fcfbf6 0%, #f1f5ea 100%); padding:32px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid rgba(98,143,63,0.14); box-shadow:0 20px 50px rgba(62,48,25,0.08);">
                <tr>
                    <td style="background:#3a5826; background:linear-gradient(145deg, #3a5826 0%, #30471f 100%); padding:26px 28px; color:#ffffff;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align:middle;">
                                    <table role="presentation" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="vertical-align:middle; padding-right:14px;">
                                                <div style="width:44px; height:44px; border-radius:14px; background:#ffffff; color:#3a5826; font-weight:700; font-size:15px; line-height:44px; text-align:center; font-family:'Noto Sans', Arial, sans-serif;">PB</div>
                                            </td>
                                            <td style="vertical-align:middle;">
                                                <div style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; opacity:0.88; font-weight:700;">Shantasra</div>
                                                <div style="font-size:12px; opacity:0.78; margin-top:2px;">UAE to Ethiopia</div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <h1 style="margin:18px 0 0; font-size:26px; line-height:1.25; font-weight:600; font-family:'Noto Sans', Georgia, serif;">{{ $campaign->title }}</h1>
                    </td>
                </tr>

                @if ($campaign->image_url)
                    <tr>
                        <td>
                            <img src="{{ $campaign->image_url }}" alt="{{ $campaign->title }}" width="640" style="display:block; width:100%; max-width:640px; height:auto; border:0;">
                        </td>
                    </tr>
                @endif

                <tr>
                    <td style="padding:28px 28px 32px;">
                        <p style="margin:0 0 16px; color:#5c5348; font-size:15px; line-height:1.5;">Hi {{ $user->name }},</p>
                        <div style="color:#3d3a34; font-size:15px; line-height:1.75;">{!! $campaign->body !!}</div>

                        @if ($campaign->cta_text && $campaign->cta_url)
                            <div style="margin-top:28px;">
                                <a href="{{ $campaign->cta_url }}" style="display:inline-block; padding:14px 26px; border-radius:16px; background:#3a5826; color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; box-shadow:0 8px 20px rgba(76,115,48,0.25);">
                                    {{ $campaign->cta_text }}
                                </a>
                            </div>
                        @endif
                    </td>
                </tr>

                <tr>
                    <td style="padding:22px 28px; border-top:1px solid rgba(98,143,63,0.14); background:#f5fbf1;">
                        <p style="margin:0 0 10px; color:#647056; font-size:13px; line-height:1.55;">
                            You are receiving this email because you opted in to product updates from {{ config('app.name', 'Shantasra') }}.
                        </p>
                        <p style="margin:0; font-size:13px;">
                            <a href="{{ route('marketing.unsubscribe', $user->unsubscribe_token) }}" style="color:#4c7330; font-weight:600; text-decoration:underline;">Unsubscribe from marketing emails</a>
                        </p>
                    </td>
                </tr>
            </table>
            <p style="margin:16px 0 0; font-size:12px; color:#8a8275; text-align:center;">
                © {{ date('Y') }} {{ config('app.name', 'Shantasra') }}
            </p>
        </td>
    </tr>
</table>
</body>
</html>
