<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $userId;
    public array $walletData;

    /**
     * @param string $userId  The user whose wallet was updated
     * @param mixed  $wallet  The Wallet model or array
     */
    public function __construct(string $userId, $wallet)
    {
        $this->userId = $userId;
        $this->walletData = [
            'balance'        => $wallet->balance ?? 0,
            'escrow_balance' => $wallet->escrow_balance ?? 0,
            'locked_balance' => $wallet->locked_balance ?? 0,
            'currency'       => $wallet->currency ?? 'VND',
        ];
    }

    /**
     * Broadcast to the user's private channel.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('User.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'WalletUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'wallet'  => $this->walletData,
            'message' => 'Số dư ví đã được cập nhật.',
        ];
    }
}
