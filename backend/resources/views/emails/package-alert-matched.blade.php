<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Package Posted Alert</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
            background: linear-gradient(135deg, #1C160F 0%, #3a2c1d 100%);
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .badge {
            display: inline-block;
            background: #f59e0b;
            color: #1C160F;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .content {
            padding: 24px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .alert-box {
            background: #fffbebfb;
            border: 1px solid #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .route-title {
            font-size: 18px;
            font-weight: 800;
            color: #1C160F;
            margin: 0 0 8px 0;
        }
        .details-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        .details-grid td {
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }
        .details-grid td.label {
            color: #64748b;
            font-weight: 500;
            width: 35%;
        }
        .details-grid td.value {
            color: #0f172a;
            font-weight: 700;
        }
        .cta-container {
            text-align: center;
            margin: 28px 0 16px;
        }
        .cta-button {
            background-color: #f59e0b;
            color: #1C160F;
            text-decoration: none;
            padding: 12px 28px;
            font-weight: 800;
            font-size: 14px;
            border-radius: 12px;
            display: inline-block;
        }
        .footer {
            background-color: #f8fafc;
            padding: 16px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="badge">PeerBridge Route Alert</div>
            <h1>📦 New Package Posted!</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello {{ $user->name }},</div>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                A new package matching your saved route notification alert for 
                <strong>{{ $alert->from_city }} ➔ {{ $alert->to_city }}</strong> has just been created on PeerBridge Delivery!
            </p>

            <div class="alert-box">
                <div class="route-title">
                    📍 {{ $shipment->from_city }} ➔ {{ $shipment->to_city }}
                </div>
                <table class="details-grid">
                    <tr>
                        <td class="label">Recipient Name</td>
                        <td class="value">{{ $shipment->receiver_name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Package Weight</td>
                        <td class="value">{{ $shipment->weight }} kg</td>
                    </tr>
                    <tr>
                        <td class="label">Travel / Needed Date</td>
                        <td class="value">{{ $shipment->travel_date ? \Illuminate\Support\Carbon::parse($shipment->travel_date)->format('M d, Y') : 'Flexible' }}</td>
                    </tr>
                    @if($shipment->category)
                    <tr>
                        <td class="label">Category</td>
                        <td class="value">{{ $shipment->category->name }}</td>
                    </tr>
                    @endif
                    @if($shipment->description)
                    <tr>
                        <td class="label">Description</td>
                        <td class="value" style="font-weight: normal; color: #334155;">{{ $shipment->description }}</td>
                    </tr>
                    @endif
                </table>
            </div>

            <div class="cta-container">
                <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}" class="cta-button">
                    View Package in Dashboard
                </a>
            </div>
        </div>
        <div class="footer">
            You received this email because you created a package route notification on PeerBridge Delivery.<br>
            © {{ date('Y') }} PeerBridge Delivery. All rights reserved.
        </div>
    </div>
</body>
</html>
