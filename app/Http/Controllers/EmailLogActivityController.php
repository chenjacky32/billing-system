<?php

namespace App\Http\Controllers;

use App\Models\EmailsLogs;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EmailLogActivityController extends Controller
{
    public function index(Request $request)
    {
        $data = EmailsLogs::query()
            ->when($request->has('search'), function($query) use ($request) {
                $searchTerm = "%".$request->input('search')."%";
                
                return $query->where(function($q) use ($searchTerm){
                    $q->where('subject', "like", $searchTerm)
                        ->orWhere('recipient_email', 'like', $searchTerm);
                });
            })
            ->when($request->filled("status"), function($query) use ($request) {
                return $query->where('status', $request->input('status'));
            })
            ->orderBy('id','desc')
            ->paginate(10);

        return Inertia::render("LogActivity/Email",[
            "filters"=> $request->only('search', "status"),
            "data"=> $data
        ]);
    }
}
