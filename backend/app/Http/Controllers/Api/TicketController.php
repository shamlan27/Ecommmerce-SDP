<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = $request->user()->tickets()
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'type' => 'sometimes|in:inquiry,complaint,return,feedback',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'order_id' => 'nullable|exists:orders,id',
            'message' => 'required|string|max:5000',
        ]);

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'order_id' => $request->order_id,
            'subject' => $request->subject,
            'type' => $request->input('type', 'inquiry'),
            'priority' => $request->input('priority', 'medium'),
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_staff_reply' => false,
        ]);

        return response()->json($ticket->load('messages.user'), 201);
    }

    public function show(Request $request, Ticket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id && !in_array($request->user()->role, ['admin', 'support'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $ticket->load(['messages.user', 'order']);

        return response()->json($ticket);
    }

    public function addMessage(Request $request, Ticket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id && !in_array($request->user()->role, ['admin', 'support'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_staff_reply' => in_array($request->user()->role, ['admin', 'support']),
        ]);

        return response()->json($message->load('user'), 201);
    }
}
