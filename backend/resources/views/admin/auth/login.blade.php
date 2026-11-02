<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | Shantasra</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Abyssinica+SIL&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --brand-50: #f5fbf1;
            --brand-600: #4c7330;
            --brand-700: #3a5826;
            --brand-800: #30471f;
            --ink: #241b14;
        }
        body {
            min-height: 100vh;
            margin: 0;
            font-family: "Noto Sans", "Noto Sans Ethiopic", sans-serif;
            color: var(--ink);
            background:
                radial-gradient(circle at top left, rgba(191, 139, 24, 0.12), transparent 28%),
                radial-gradient(circle at top right, rgba(98, 143, 63, 0.12), transparent 26%),
                linear-gradient(180deg, #fcfbf6 0%, #f1f5ea 100%);
        }
        .login-card {
            border: 1px solid rgba(98, 143, 63, 0.14);
            border-radius: 1.25rem;
            box-shadow: 0 20px 50px rgba(62, 48, 25, 0.08);
        }
        .login-logo {
            width: 3rem;
            height: 3rem;
            border-radius: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #fff;
            background: linear-gradient(145deg, var(--brand-600), var(--brand-800));
            box-shadow: 0 8px 20px rgba(76, 115, 48, 0.2);
        }
        h1 {
            font-family: "Abyssinica SIL", "Noto Sans Ethiopic", serif;
            font-size: 1.5rem;
        }
        .form-control {
            border-radius: 0.95rem;
            min-height: 2.85rem;
            border-color: rgba(98, 143, 63, 0.22);
        }
        .form-control:focus {
            border-color: rgba(76, 115, 48, 0.45);
            box-shadow: 0 0 0 0.2rem rgba(76, 115, 48, 0.12);
        }
        .btn-admin-login {
            border-radius: 1rem;
            min-height: 2.85rem;
            font-weight: 600;
            background: linear-gradient(145deg, var(--brand-700), var(--brand-600));
            border: none;
        }
        .btn-admin-login:hover {
            background: linear-gradient(145deg, var(--brand-800), var(--brand-700));
        }
    </style>
</head>
<body>
    <div class="container min-vh-100 d-flex align-items-center justify-content-center py-4 px-3">
        <div class="w-100" style="max-width: 420px;">
            <div class="text-center mb-4">
                <div class="login-logo mx-auto mb-3">PB</div>
                <h1 class="mb-1">Admin sign in</h1>
                <p class="text-muted small mb-0">Shantasra operations console</p>
            </div>
            <div class="card login-card border-0 bg-white">
                <div class="card-body p-4 p-md-5">
                    @if ($errors->any())
                        <div class="alert alert-danger rounded-4 border-0 small">{{ $errors->first() }}</div>
                    @endif

                    @if (session('success'))
                        <div class="alert alert-success rounded-4 border-0 small" style="background: var(--brand-50); color: var(--brand-800);">{{ session('success') }}</div>
                    @endif

                    <form method="POST" action="{{ route('admin.login.store') }}">
                        @csrf
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Email</label>
                            <input type="email" name="email" class="form-control" value="{{ old('email', 'admin@peerbridge.test') }}" required autocomplete="username">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Password</label>
                            <input type="password" name="password" class="form-control" value="password" required autocomplete="current-password">
                        </div>
                        <div class="form-check mb-4">
                            <input class="form-check-input" type="checkbox" name="remember" id="remember">
                            <label class="form-check-label small" for="remember">Remember me</label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-admin-login w-100 text-white">Sign in</button>
                    </form>
                </div>
            </div>
            <p class="text-center text-muted small mt-4 mb-0">
                <a href="{{ url('/') }}" class="text-decoration-none fw-semibold" style="color: var(--brand-600);">← Back to site</a>
            </p>
        </div>
    </div>
</body>
</html>
