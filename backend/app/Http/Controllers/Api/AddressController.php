<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->addresses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'sometimes|in:shipping,billing',
            'name' => 'required|string|max:255',
            'line1' => 'required|string|max:255',
            'line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip' => 'required|string|max:20',
            'country' => 'sometimes|string|max:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($request->boolean('is_default')) {
            $request->user()->addresses()
                ->where('type', $request->input('type', 'shipping'))
                ->update(['is_default' => false]);
        }

        $address = Address::create(array_merge(
            $request->only(['type', 'name', 'line1', 'line2', 'city', 'state', 'zip', 'country', 'phone', 'is_default']),
            ['user_id' => $request->user()->id]
        ));

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'line1' => 'sometimes|string|max:255',
            'line2' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:255',
            'state' => 'sometimes|string|max:255',
            'zip' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($request->boolean('is_default')) {
            $request->user()->addresses()
                ->where('type', $address->type)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($request->only(['name', 'line1', 'line2', 'city', 'state', 'zip', 'country', 'phone', 'is_default']));

        return response()->json($address);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }
}
