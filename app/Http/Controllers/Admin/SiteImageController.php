<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SiteImageController extends Controller
{
    /**
     * List the replaceable image slots of the public site.
     */
    public function index(): Response
    {
        $overrides = SiteImage::query()->pluck('path', 'key');

        return Inertia::render('admin/site-images', [
            'slots' => collect(SiteImage::SLOTS)
                ->map(fn (array $slot, string $key) => [
                    'key' => $key,
                    'label' => $slot['label'],
                    'description' => $slot['description'],
                    'url' => $overrides[$key] ?? $slot['default'],
                    'isCustom' => isset($overrides[$key]),
                    'hasDefault' => $slot['default'] !== null,
                ])
                ->values()
                ->all(),
        ]);
    }

    /**
     * Replace the image of a slot.
     */
    public function update(Request $request, string $key): RedirectResponse
    {
        abort_unless(array_key_exists($key, SiteImage::SLOTS), 404);

        $request->validate([
            'image' => ['required', 'image', 'max:4096'],
        ]);

        $path = '/storage/'.$request->file('image')->store('site', 'public');

        $previous = SiteImage::query()->where('key', $key)->first();

        if ($previous !== null) {
            $this->deleteUploadedFile($previous->path);
        }

        SiteImage::query()->updateOrCreate(['key' => $key], ['path' => $path]);

        return redirect()->route('admin.site-images.index')->with('success', 'Image mise à jour.');
    }

    /**
     * Remove the override of a slot: the site falls back to the
     * bundled default image.
     */
    public function destroy(string $key): RedirectResponse
    {
        abort_unless(array_key_exists($key, SiteImage::SLOTS), 404);

        $override = SiteImage::query()->where('key', $key)->first();

        if ($override !== null) {
            $this->deleteUploadedFile($override->path);
            $override->delete();
        }

        $hasDefault = SiteImage::SLOTS[$key]['default'] !== null;

        return redirect()
            ->route('admin.site-images.index')
            ->with('success', $hasDefault ? 'Image d\'origine restaurée.' : 'Image retirée.');
    }

    /**
     * Delete an uploaded override file. Bundled defaults under
     * /images are never touched.
     */
    protected function deleteUploadedFile(string $path): void
    {
        if (str_starts_with($path, '/storage/')) {
            Storage::disk('public')->delete(Str::after($path, '/storage/'));
        }
    }
}
