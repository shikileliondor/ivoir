<?php

namespace App\Http\Requests\Shop;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }

    /**
     * The customer's details, without the cart.
     *
     * @return array{customer_name: string, customer_phone: string, customer_email: string|null, address: string, city: string}
     */
    public function customer(): array
    {
        /** @var array{customer_name: string, customer_phone: string, customer_email: string|null, address: string, city: string} $customer */
        $customer = $this->safe()->except('items');

        return $customer;
    }

    /**
     * The cart as product id => quantity, with the same product listed twice
     * merged into a single line and capped at the per-product maximum.
     *
     * @return array<int, int>
     */
    public function quantities(): array
    {
        /** @var array<int, array{product_id: int|string, quantity: int|string}> $items */
        $items = $this->safe()->array('items');

        $quantities = [];

        foreach ($items as $item) {
            $productId = (int) $item['product_id'];
            $quantities[$productId] = min(50, ($quantities[$productId] ?? 0) + (int) $item['quantity']);
        }

        return $quantities;
    }
}
