<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class OgImageController extends Controller
{
    public function package(int $shipmentId): Response
    {
        $shipment = Shipment::findOrFail($shipmentId);
        $title = Str::limit($this->safeText($shipment->description ?: 'Package delivery request'), 52, '');
        $subtitle = "{$shipment->from_city} to {$shipment->to_city}";

        return $this->image($title, $subtitle);
    }

    public function route(string $origin, string $destination): Response
    {
        return $this->image(
            'Shantasra',
            Str::headline(str_replace('-', ' ', $origin)).' to '.Str::headline(str_replace('-', ' ', $destination))
        );
    }

    private function image(string $title, string $subtitle): Response
    {
        $title = htmlspecialchars($title, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $subtitle = htmlspecialchars($subtitle, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0D3326"/>
  <circle cx="1050" cy="90" r="220" fill="#B89358" opacity=".22"/>
  <circle cx="120" cy="570" r="260" fill="#B89358" opacity=".12"/>
  <text x="80" y="115" fill="#F6D99A" font-family="Arial, sans-serif" font-size="32" font-weight="700">PEERBRIDGE DELIVERY</text>
  <text x="80" y="300" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="58" font-weight="700">{$title}</text>
  <text x="80" y="375" fill="#D9E7DF" font-family="Arial, sans-serif" font-size="34">{$subtitle}</text>
</svg>
SVG;

        return response($svg, 200, ['Content-Type' => 'image/svg+xml; charset=UTF-8', 'Cache-Control' => 'public, max-age=3600']);
    }

    private function safeText(string $text): string
    {
        return trim((string) preg_replace([
            '/[\w.+-]+@[\w-]+\.[\w.-]+/i',
            '/(?:\+?\d[\d\s().-]{7,}\d)/',
        ], '[private contact removed]', $text));
    }
}
