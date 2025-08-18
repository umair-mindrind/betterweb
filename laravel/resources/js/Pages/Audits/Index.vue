<template>
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                Audits
            </h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 text-gray-900">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-medium">Website Audits</h3>
                            <Link
                                :href="route('audits.create')"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                New Audit
                            </Link>
                        </div>

                        <div v-if="audits.data.length === 0" class="text-center py-8">
                            <p class="text-gray-500">No audits found. Start by creating your first audit.</p>
                        </div>

                        <div v-else class="space-y-4">
                            <div
                                v-for="audit in audits.data"
                                :key="audit.id"
                                class="border rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-gray-900">{{ audit.url }}</h4>
                                        <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Status: 
                                                <span :class="{
                                                    'text-yellow-600': audit.status === 'queued',
                                                    'text-blue-600': audit.status === 'running',
                                                    'text-green-600': audit.status === 'completed',
                                                    'text-red-600': audit.status === 'failed'
                                                }">
                                                    {{ audit.status }}
                                                </span>
                                            </span>
                                            <span>Created: {{ new Date(audit.created_at).toLocaleDateString() }}</span>
                                            <span v-if="audit.total_score">Score: {{ audit.total_score }}/100</span>
                                        </div>
                                    </div>
                                    <Link
                                        :href="route('audits.show', audit.id)"
                                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="audits.links && audits.links.length > 3" class="mt-6">
                            <nav class="flex justify-center">
                                <div class="flex space-x-1">
                                    <Link
                                        v-for="(link, key) in audits.links"
                                        :key="key"
                                        :href="link.url"
                                        :class="{
                                            'px-3 py-2 text-sm leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700': true,
                                            'bg-blue-50 text-blue-600 border-blue-300': link.active
                                        }"
                                        v-html="link.label"
                                    />
                                </div>
                            </nav>
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
    audits: Object
});
</script> 