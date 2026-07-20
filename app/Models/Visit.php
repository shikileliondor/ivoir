<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A single page view on the public shop, used for visitor stats.
 *
 * @property int $id
 * @property Carbon $visited_on
 * @property string $session_hash
 * @property string $path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['visited_on', 'session_hash', 'path'])]
class Visit extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visited_on' => 'date',
        ];
    }
}
