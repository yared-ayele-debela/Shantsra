<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class AdminTestingToolsTest extends TestCase
{
    use RefreshDatabase;

    public function test_testing_tools_require_admin_authentication(): void
    {
        $this->getJson(route('admin.tools.health'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_check_backend_health(): void
    {
        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'testing-tools@example.com',
            'password' => 'password',
        ]);

        $this->actingAs($admin, 'admin')
            ->getJson(route('admin.tools.health'))
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.application', true)
            ->assertJsonPath('checks.database', true)
            ->assertJsonPath('checks.storage', true);
    }

    public function test_admin_can_run_allowlisted_maintenance_command(): void
    {
        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'maintenance-tools@example.com',
            'password' => 'password',
        ]);

        Artisan::shouldReceive('call')
            ->once()
            ->with('optimize:clear')
            ->andReturn(0);
        Artisan::shouldReceive('output')
            ->once()
            ->andReturn('Application cache cleared.');

        $this->actingAs($admin, 'admin')
            ->postJson(route('admin.tools.run', 'optimize-clear'))
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'command' => 'optimize:clear',
                'output' => 'Application cache cleared.',
            ]);
    }

    public function test_admin_can_create_the_storage_link(): void
    {
        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'storage-tools@example.com',
            'password' => 'password',
        ]);

        Artisan::shouldReceive('call')
            ->once()
            ->with('storage:link')
            ->andReturn(0);
        Artisan::shouldReceive('output')
            ->once()
            ->andReturn('The [public/storage] directory has been linked.');

        $this->actingAs($admin, 'admin')
            ->postJson(route('admin.tools.run', 'storage-link'))
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'command' => 'storage:link',
                'output' => 'The [public/storage] directory has been linked.',
            ]);
    }
}
