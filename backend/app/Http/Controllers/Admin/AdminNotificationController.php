<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AdminNotificationController extends Controller
{
    public function index(): View
    {
        $notifications = AdminNotification::with(['user', 'shipment'])
            ->latest()
            ->paginate(15);

        $unreadCount = AdminNotification::unread()->count();

        return view('admin.notifications.index', compact('notifications', 'unreadCount'));
    }

    public function markAsRead(AdminNotification $notification): RedirectResponse
    {
        $notification->update(['is_read' => true]);

        if ($notification->shipment_id) {
            return redirect()->route('admin.shipments.show', $notification->shipment_id)
                ->with('success', 'Notification marked as read.');
        }

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAllAsRead(): RedirectResponse
    {
        AdminNotification::unread()->update(['is_read' => true]);

        return back()->with('success', 'All admin notifications marked as read.');
    }

    public function destroy(AdminNotification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'Notification deleted successfully.');
    }
}
