<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header Section -->
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold tracking-tight">Utilizadores</h1>
        <div class="flex items-center gap-2">
          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar utilizadores..."
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
            />
            <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            @click="showUserFormDialog = true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus class="mr-2 h-4 w-4" />
            Novo
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow">
      <div class="p-1 md:p-6">
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  Username
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  Nome
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden md:table-cell">
                  Email
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden md:table-cell">
                  Telefone
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  Estado
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell">
                  Clínica
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell">
                  Perfis
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] font-medium">
                  {{ user.username }}
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  {{ user.name }}
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden md:table-cell">
                  {{ user.email }}
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden md:table-cell">
                  {{ user.phone }}
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                      user.active
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-inset ring-green-600/20'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-inset ring-red-600/20'
                    ]"
                  >
                    {{ user.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell">
                  {{ user.clinic }}
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] hidden lg:table-cell">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(profile, index) in user.profiles"
                      :key="index"
                      class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      {{ profile }}
                    </span>
                  </div>
                </td>
                <td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                  <div class="flex items-center gap-2">
                    <button
                      @click="selectedUser = user; showUserFormDialog = true"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                      title="Editar"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button
                      @click="user.active = !user.active"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                      :title="user.active ? 'Suspender' : 'Ativar'"
                    >
                      <component :is="user.active ? ShieldOff : CheckCircle" class="h-4 w-4" />
                    </button>
                    <button
                      @click="selectedUser = user; showAssignProfilesDialog = true"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                      title="Perfis"
                    >
                      <BadgePlus class="h-4 w-4" />
                    </button>
                    <button
                      @click="selectedUser = user; showAssignClinicDialog = true"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                      title="Clínica"
                    >
                      <Building class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="8" class="p-4 text-center text-muted-foreground">
                  Nenhum utilizador encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between px-2 py-4 border-t">
        <div class="text-sm text-muted-foreground">
          Mostrando 1-{{ Math.min(users.length, 10) }} de {{ users.length }} utilizadores
        </div>
        <div class="flex items-center space-x-6 lg:space-x-8">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium">Registos por página</p>
            <select
              v-model="pageSize"
              class="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
            >
              <ChevronLeft class="h-4 w-4" />
              <span class="sr-only">Página anterior</span>
            </button>
            <div class="text-sm font-medium">
              Página 1 de 1
            </div>
            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
            >
              <ChevronRight class="h-4 w-4" />
              <span class="sr-only">Próxima página</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Form Dialog (Create/Edit) -->
    <Teleport to="body">
      <div
        v-if="showUserFormDialog"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div class="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 class="text-lg font-semibold leading-none tracking-tight">
              {{ selectedUser ? 'Editar Utilizador' : 'Novo Utilizador' }}
            </h2>
            <p class="text-sm text-muted-foreground">
              {{ selectedUser ? 'Atualize os dados do utilizador' : 'Preencha os dados para criar um novo utilizador' }}
            </p>
          </div>
          <form @submit.prevent="showUserFormDialog = false" class="space-y-4">
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="username" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username
                </label>
                <div class="col-span-3">
                  <input
                    id="username"
                    type="text"
                    required
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    :value="selectedUser ? selectedUser.username : ''"
                  />
                </div>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="name" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nome
                </label>
                <div class="col-span-3">
                  <input
                    id="name"
                    type="text"
                    required
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    :value="selectedUser ? selectedUser.name : ''"
                  />
                </div>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="email" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div class="col-span-3">
                  <input
                    id="email"
                    type="email"
                    required
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    :value="selectedUser ? selectedUser.email : ''"
                  />
                </div>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="phone" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Telefone
                </label>
                <div class="col-span-3">
                  <input
                    id="phone"
                    type="tel"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    :value="selectedUser ? selectedUser.phone : ''"
                  />
                </div>
              </div>
              <div v-if="!selectedUser" class="grid grid-cols-4 items-center gap-4">
                <label for="password" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Senha
                </label>
                <div class="col-span-3">
                  <input
                    id="password"
                    type="password"
                    required
                    minlength="6"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div v-if="!selectedUser" class="grid grid-cols-4 items-center gap-4">
                <label for="confirmPassword" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Confirmar Senha
                </label>
                <div class="col-span-3">
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minlength="6"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <label for="clinic" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Clínica
                </label>
                <div class="col-span-3">
                  <select
                    id="clinic"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione uma clínica</option>
                    <option value="1" :selected="selectedUser && selectedUser.clinic === 'Clínica Central'">Clínica Central</option>
                    <option value="2" :selected="selectedUser && selectedUser.clinic === 'Clínica Norte'">Clínica Norte</option>
                    <option value="3" :selected="selectedUser && selectedUser.clinic === 'Clínica Sul'">Clínica Sul</option>
                    <option value="4" :selected="selectedUser && selectedUser.clinic === 'Clínica Este'">Clínica Este</option>
                    <option value="5" :selected="selectedUser && selectedUser.clinic === 'Clínica Oeste'">Clínica Oeste</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                type="button"
                @click="showUserFormDialog = false; selectedUser = null"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2 sm:mt-0"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Assign Profiles Dialog -->
    <Teleport to="body">
      <div
        v-if="showAssignProfilesDialog && selectedUser"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div class="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 class="text-lg font-semibold leading-none tracking-tight">
              Atribuir Perfis
            </h2>
            <p class="text-sm text-muted-foreground">
              Selecione os perfis para {{ selectedUser.name }}
            </p>
          </div>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <div v-for="(profile, index) in availableProfiles" :key="index" class="flex items-center space-x-2">
                <input
                  :id="`profile-${index}`"
                  type="checkbox"
                  :checked="selectedUser.profiles.includes(profile)"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label :for="`profile-${index}`" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {{ profile }}
                </label>
              </div>
            </div>
          </div>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              @click="showAssignProfilesDialog = false; selectedUser = null"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2 sm:mt-0"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="showAssignProfilesDialog = false; selectedUser = null"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Assign Clinic Dialog -->
    <Teleport to="body">
      <div
        v-if="showAssignClinicDialog && selectedUser"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div class="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 class="text-lg font-semibold leading-none tracking-tight">
              Atribuir Clínica
            </h2>
            <p class="text-sm text-muted-foreground">
              Selecione a clínica para {{ selectedUser.name }}
            </p>
          </div>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <label for="assign-clinic" class="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Clínica
              </label>
              <div class="col-span-3">
                <select
                  id="assign-clinic"
                  class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma clínica</option>
                  <option value="1" :selected="selectedUser.clinic === 'Clínica Central'">Clínica Central</option>
                  <option value="2" :selected="selectedUser.clinic === 'Clínica Norte'">Clínica Norte</option>
                  <option value="3" :selected="selectedUser.clinic === 'Clínica Sul'">Clínica Sul</option>
                  <option value="4" :selected="selectedUser.clinic === 'Clínica Este'">Clínica Este</option>
                  <option value="5" :selected="selectedUser.clinic === 'Clínica Oeste'">Clínica Oeste</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              @click="showAssignClinicDialog = false; selectedUser = null"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2 sm:mt-0"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="showAssignClinicDialog = false; selectedUser = null"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, Plus, Edit, ShieldOff, CheckCircle, 
  BadgePlus, Building, ChevronLeft, ChevronRight 
} from 'lucide-vue-next'

// Static data
const users = ref([
  {
    id: 1,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+351 912345678',
    active: true,
    clinic: 'Clínica Central',
    profiles: ['Admin', 'Médico']
  },
  {
    id: 2,
    username: 'janedoe',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+351 923456789',
    active: true,
    clinic: 'Clínica Norte',
    profiles: ['Médico']
  },
  {
    id: 3,
    username: 'bobsmith',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+351 934567890',
    active: false,
    clinic: 'Clínica Central',
    profiles: ['Enfermeiro']
  },
  {
    id: 4,
    username: 'alicegreen',
    name: 'Alice Green',
    email: 'alice@example.com',
    phone: '+351 945678901',
    active: true,
    clinic: 'Clínica Sul',
    profiles: ['Médico', 'Diretor']
  },
  {
    id: 5,
    username: 'carlosrodriguez',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    phone: '+351 956789012',
    active: true,
    clinic: 'Clínica Norte',
    profiles: ['Enfermeiro']
  }
])

const availableProfiles = ['Admin', 'Médico', 'Enfermeiro', 'Diretor', 'Recepcionista']

// UI state
const searchQuery = ref('')
const pageSize = ref(10)
const selectedUser = ref(null)
const showUserFormDialog = ref(false)
const showAssignProfilesDialog = ref(false)
const showAssignClinicDialog = ref(false)

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})
</script>

<style scoped>
/* Add any component-specific styles here */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>