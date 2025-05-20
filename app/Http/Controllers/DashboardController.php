<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\ApartmentTower;
use App\Models\Billing;
use App\Models\UserApartmentOkgo;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {

        $user = Auth::user();
        $role = $user->role;



        if ($role === 'SUPER ADMIN') {
            $apartments = Apartment::with(['towers','userApartments' => function($query){
                $query->where('active',1);
            }])->get();


            $data = [];

            foreach ($apartments as $apartment) {
                // check if the apartment has any towers
                $towerCount = $apartment->towers->count();

                if ($towerCount > 0){
                    $totalRooms = $apartment->towers->sum('total_room');
                } else {
                    $totalRooms = $apartment->total_room;
                }

                $occupiedRooms = $apartment->userApartments->count();

                $occupiedPercentage = $totalRooms ? ($occupiedRooms / $totalRooms) * 100 : 0;
                $vacantPercentage = 100 - $occupiedPercentage;


                $towerData = [];
                foreach ($apartment->towers as $tower) {
                    $towerTotal = $tower->total_room;
                    $towerOccupied = $apartment->userApartments->where('apartmentTowerId', $tower->id)->count();
                    $towerOccupiedPercentage = $towerTotal ? ($towerOccupied / $towerTotal) * 100 : 0;
                    $towerVacantPercentage = 100 - $towerOccupiedPercentage;
        
                    $towerData[] = [
                        'towerName' => $tower->tower_name,
                        'totalRoom' => $towerTotal,
                        'occupied' => $towerOccupiedPercentage,
                        'vacant' => $towerVacantPercentage,
                        'pieData'=>[
                            'labels' => ['Sudah Terisi', 'Kosong'],
                            'datasets' => [
                                [
                                    'data' => [$towerOccupiedPercentage, $towerVacantPercentage],
                                    'backgroundColor' => ['#7e4efb', '#FF6384'],
                                    'hoverBackgroundColor' => ['#7e4efb', '#FF6384'],
                                ],
                            ]
                        ],
                    ];
                }

                $pieData = [
                    'labels' => ['Sudah Terisi', 'Kosong'],
                    'datasets' => [
                        [
                            'data' => [$occupiedPercentage, $vacantPercentage],
                            'backgroundColor' => ['#7e4efb', '#FF6384'],
                            'hoverBackgroundColor' => ['#7e4efb', '#FF6384'],
                        ],
                    ],
                ];


                $data[] = [
                    'occupied' => $occupiedPercentage,
                    'vacant' => $vacantPercentage,
                    'labels' => ['Sudah Terisi', 'Kosong'],
                    'apartmentName' => $apartment->name,
                    'pieData' => $pieData, // Include pieData
                    'towerData' => $towerData,
                ];
            }
        } else {
            // Fetch data for the user's apartment
            $apartmentId = $user->apartment_id;
            $apartment = Apartment::where('id', $apartmentId)
            ->with([
                'towers',
                'userApartments' => function($query){
                    $query->where('active',1);
                }
            ])
            ->first();

            if ($apartment) {
                $totalRooms = $apartment->towers->isNotEmpty() 
                ? $apartment->towers->sum('total_room') 
                : $apartment->total_room;

                $occupiedRooms = $apartment->userApartments->count();
                $occupiedPercentage = $totalRooms ? ($occupiedRooms / $totalRooms) * 100 : 0;               
                $vacantPercentage = 100 - $occupiedPercentage;
                // $totalRooms = $apartment->total_room;

                $pieData = [
                    'labels' => ['Sudah Terisi', 'Kosong'],
                    'datasets' => [
                        [
                            'data' => [$occupiedPercentage, $vacantPercentage],
                            'backgroundColor' => ['#7e4efb', '#FF6384'],
                            'hoverBackgroundColor' => ['#7e4efb', '#FF6384'],
                        ],
                    ],
                ];

                $towerData = [];

                foreach ($apartment->towers as $tower) {
                    // fetch total active user in the tower
                    $towerOccupied = UserApartmentOkgo::where('apartmentTowerId', $tower->id)
                        ->where('active', 1)
                        ->count();
        
                    $towerTotalRoom = $tower->total_room;
                    $towerOccupiedPercentage = $towerTotalRoom > 0 ? ($towerOccupied / $towerTotalRoom) * 100 : 0;
                    $towerVacantPercentage = 100 - $towerOccupiedPercentage;
        
                    $towerData[] = [
                        'towerName' => $tower->tower_name,
                        'totalRoom' => $towerTotalRoom,
                        'occupied' => $towerOccupiedPercentage,
                        'vacant' => $towerVacantPercentage,
                        'pieData'=>[
                            'labels' => ['Sudah Terisi', 'Kosong'],
                            'datasets' => [
                                [
                                    'data' => [$towerOccupiedPercentage, $towerVacantPercentage],
                                    'backgroundColor' => ['#7e4efb', '#FF6384'],
                                    'hoverBackgroundColor' => ['#7e4efb', '#FF6384'],
                                ],
                            ]
                        ],
                    ];
                }

                $data = [
                    'occupied' => $occupiedPercentage,
                    'vacant' => $vacantPercentage,
                    'labels' => ['Sudah Terisi', 'Kosong'],
                    'apartmentName' => $apartment->name,
                    'pieData' => $pieData,
                    'towerData' => $towerData, // Include pieData
                ];
            } else {
                $data = [
                    'occupied' => 0,
                    'vacant' => 100,
                    'labels' => ['Sudah Terisi', 'Kosong']
                ];
            }
        }

        // Define billing types
        $billingTypes = ['AIR', 'LISTRIK', 'MAINTENANCE', 'PARKIR'];

        // Initialize billing charts array
        $billingCharts = [];

        foreach ($billingTypes as $type) {
            $selectedPeriod = $request->get('period');

            if(empty($selectedPeriod) || $selectedPeriod === 'null') {
                $selectedPeriod = Carbon::now()->format('Y-m-01');
            }

            $paidData = Billing::with(['apartment','createdBy','tower','residence.user'])
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->where('status', 'success')
                ->where('billing_type', $type)
                ->where('period', $selectedPeriod)
                ->count();

            $unpaidData = Billing::with(['apartment','createdBy','tower','residence.user'])
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->where('status', 'pending')
                ->where('billing_type', $type)
                ->where('period', $selectedPeriod)
                ->where('due_date', '>=', today())
                ->count();

            $penaltyData = Billing::with(['apartment','createdBy','tower','residence.user'])
                ->when($role !== 'SUPER ADMIN', function ($query) use ($user) {
                    return $query->where('apartment_id', $user->apartment_id);
                })
                ->where('status', 'pending')
                ->where('billing_type', $type)
                ->where('period', $selectedPeriod)
                ->where('due_date', '<', today())
                ->count();

            $total = $paidData + $unpaidData + $penaltyData;

            $billingCharts[$type] = [
                'data' => [
                    [
                        'label' => 'Telah Lunas',
                        'count' => $paidData,
                        'percentage' => $total > 0 ? ($paidData / $total) * 100 : 0,
                    ],
                    [
                        'label' => 'Belum Lunas dan Belum Jatuh Tempo',
                        'count' => $unpaidData,
                        'percentage' => $total > 0 ? ($unpaidData / $total) * 100 : 0,
                    ],
                    [
                        'label' => 'Belum Lunas dan Sudah Jatuh Tempo',
                        'count' => $penaltyData,
                        'percentage' => $total > 0 ? ($penaltyData / $total) * 100 : 0,
                    ],
                ],
                'total' => $total
            ];
        }

        return Inertia::render('Dashboard/Dashboard', [
            'data' => $data,
            'paidData' => $paidData,
            'unpaidData' => $unpaidData,
            'penaltyData' => $penaltyData,
            'billingChartData' => $billingCharts,
        ]);
    }
}
