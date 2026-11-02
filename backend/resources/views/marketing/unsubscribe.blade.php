<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Marketing Preferences | Shantasra</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-5 text-center">
                    @if ($success)
                        <div class="display-6 mb-3">You are unsubscribed</div>
                        <p class="text-muted mb-0">
                            {{ $user?->email ?? 'This email address' }} will no longer receive marketing announcements from Shantasra.
                        </p>
                    @else
                        <div class="display-6 mb-3">Link not available</div>
                        <p class="text-muted mb-0">
                            This unsubscribe link is invalid or has already expired.
                        </p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
