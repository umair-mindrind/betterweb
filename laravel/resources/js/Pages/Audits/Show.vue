<template>
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Audit Details
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 text-gray-900">
                        <!-- Audit Summary -->
                        <div class="mb-8">
                            <h3 class="text-lg font-medium mb-4">Audit Summary</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600">URL</p>
                                    <p class="font-medium">{{ audit.url }}</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600">Status</p>
                                    <p :class="{
                                        'text-yellow-600': audit.status === 'queued',
                                        'text-blue-600': audit.status === 'running',
                                        'text-green-600': audit.status === 'completed',
                                        'text-red-600': audit.status === 'failed'
                                    }" class="font-medium">
                                        {{ audit.status }}
                                    </p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600">Total Score</p>
                                    <p class="font-medium">{{ audit.total_score || 'N/A' }}/100</p>
                                </div>
                            </div>
                            <div v-if="recentScores && recentScores.length" class="mb-6">
                                <h4 class="text-sm font-medium mb-2">Recent scores</h4>
                                <div class="flex items-end space-x-1 h-12">
                                    <div v-for="s in recentScores.slice().reverse()" :key="s.id" class="w-4" :title="s.created_at + ': ' + (s.total_score ?? 'N/A')">
                                        <div :style="{height: (s.total_score || 0) + '%', background:'#3b82f6', borderRadius: '2px'}"></div>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-500 mt-2">Last {{ recentScores.length }} audits (left oldest → right newest)</div>
                            </div>
                        </div>

                        <!-- Audit Results -->
                        <div v-if="audit.results && audit.results.length > 0">
                            <h3 class="text-lg font-medium mb-4">Audit Results</h3>
                            <div class="space-y-4">
                                <div
                                    v-for="result in audit.results"
                                    :key="result.id"
                                    class="border rounded-lg p-4"
                                >
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="font-medium text-gray-900 capitalize">{{ result.tool }}</h4>
                                        <span :class="{
                                            'text-green-600': result.success,
                                            'text-red-600': !result.success
                                        }" class="text-sm font-medium">
                                            {{ result.success ? 'Success' : 'Failed' }}
                                        </span>
                                    </div>
                                    
                                    <div class="text-sm text-gray-600 mb-2">
                                        <p>Duration: {{ result.duration_ms }}ms</p>
                                        <p v-if="result.error_message" class="text-red-600">
                                            Error: {{ result.error_message }}
                                        </p>
                                    </div>

                                    <div v-if="result.normalized_json" class="mt-3">
                                        <details class="text-sm">
                                            <summary class="cursor-pointer text-blue-600 hover:text-blue-800">
                                                View Results
                                            </summary>
                                            <pre class="mt-2 bg-gray-100 p-3 rounded text-xs overflow-x-auto">{{ result.normalized_json ? (typeof result.normalized_json === 'string' ? JSON.stringify(JSON.parse(result.normalized_json), null, 2) : JSON.stringify(result.normalized_json, null, 2)) : 'No data' }}</pre>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-8">
                            <p class="text-gray-500">
                                {{ audit.status === 'queued' ? 'Audit is queued and will start soon.' : 
                                   audit.status === 'running' ? 'Audit is currently running.' : 
                                   'No results available yet.' }}
                            </p>
                        </div>

                        <div class="mt-8">
                            <Link
                                :href="route('audits.index')"
                                class="text-blue-600 hover:text-blue-800"
                            >
                                ← Back to Audits
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

defineProps({
    audit: Object
});
</script>