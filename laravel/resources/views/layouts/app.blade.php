{{-- ...existing code... --}}

<head>
    {{-- ...existing head code... --}}

    @php
        $viteManifest = public_path('build/manifest.json');
    @endphp

    @if (file_exists($viteManifest))
        {{-- Use Vite when manifest exists (production build or dev server proxy available) --}}
        @vite(['resources/js/app.js', 'resources/css/app.css'])
    @else
        {{-- Fallback when manifest is missing: load prebuilt assets or skip --}}
        <link rel="stylesheet" href="{{ asset('css/app.css') }}">
        <script src="{{ asset('js/app.js') }}" defer></script>
    @endif

    {{-- ...existing head code... --}}
</head>

{{-- ...existing code... --}}
