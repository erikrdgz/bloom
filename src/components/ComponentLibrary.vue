<script setup lang="ts">
import BloomSelect from './ui/BloomSelect.vue'
import { computed, onUnmounted, ref } from 'vue'
import { Check, Plus, AlertCircle, Info, X, ArrowUpDown } from 'lucide-vue-next'
import LibraryButton from './ui/LibraryButton.vue'
import LibrarySwitch from './ui/LibrarySwitch.vue'
import LibraryDialog from './ui/LibraryDialog.vue'
import SpecimenSection from './ui/SpecimenSection.vue'
const emit = defineEmits<{ notify: [message: string] }>()
const saving = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | undefined
function save() {
  saving.value = true
  saveTimer = setTimeout(() => {
    saving.value = false
    emit('notify', 'Example saved')
  }, 900)
}
onUnmounted(() => clearTimeout(saveTimer))
const email = ref('')
const submitted = ref(false)
const error = computed(() =>
  submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
    ? 'Enter a valid email address.'
    : '',
)
function validate() {
  submitted.value = true
  if (!error.value) emit('notify', 'Email passes validation. No message was sent.')
}
const density = ref('Comfortable')
const notes = ref('')
const checked = ref(true)
const option = ref('Private')
const enabled = ref(true)
const disabledSwitch = ref(false)
const tab = ref('Preview')
const tabs = ['Preview', 'Properties', 'Usage']
function changeTab(event: KeyboardEvent, index: number) {
  let next: number | undefined
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
  if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
  if (event.key === 'Home') next = 0
  if (event.key === 'End') next = tabs.length - 1
  if (next === undefined) return
  event.preventDefault()
  tab.value = tabs[next]!
  ;(event.currentTarget as HTMLElement).parentElement
    ?.querySelectorAll<HTMLButtonElement>('button')
    [next]?.focus()
}
const alertVisible = ref(true)
const progress = ref(64)
const dialogOpen = ref(false)
function confirmExample() {
  dialogOpen.value = false
  emit('notify', 'Example action confirmed')
}
const ascending = ref(true)
const selectedRows = ref<string[]>([])
const rows = computed(() =>
  [
    { name: 'Button', category: 'Actions', status: 'Ready' },
    { name: 'Text field', category: 'Forms', status: 'Ready' },
    { name: 'Dialog', category: 'Overlays', status: 'Review' },
  ].sort((a, b) => (ascending.value ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))),
)
const allRows = computed({
  get: () => selectedRows.value.length === rows.value.length,
  set: (value: boolean) => {
    selectedRows.value = value ? rows.value.map((row) => row.name) : []
  },
})
</script>
<template>
  <div class="component-library">
    <div class="library-intro">
      <span>14 component families</span><span>Examples use your current tokens</span>
    </div>
    <SpecimenSection
      title="Buttons"
      note="One primary action per group. Disabled and loading states retain their labels."
      code='<LibraryButton :loading="saving" @click="save">Save changes</LibraryButton>'
    >
      <div class="specimen-row">
        <LibraryButton :loading="saving" @click="save">{{
          saving ? 'Saving…' : 'Save changes'
        }}</LibraryButton
        ><LibraryButton variant="secondary" @click="emit('notify', 'Secondary action selected')"
          >Secondary</LibraryButton
        ><LibraryButton variant="quiet" @click="emit('notify', 'Quiet action selected')"
          >Quiet</LibraryButton
        ><LibraryButton variant="danger" @click="dialogOpen = true">Remove item</LibraryButton
        ><LibraryButton disabled>Unavailable</LibraryButton>
      </div>
      <div class="specimen-row">
        <LibraryButton
          size="small"
          variant="secondary"
          @click="emit('notify', 'Small button selected')"
          >Small</LibraryButton
        ><LibraryButton variant="secondary" @click="emit('notify', 'Medium button selected')"
          >Medium</LibraryButton
        ><LibraryButton
          size="large"
          variant="secondary"
          @click="emit('notify', 'Large button selected')"
          ><Plus :size="16" />Large</LibraryButton
        >
      </div>
    </SpecimenSection>
    <SpecimenSection
      title="Text fields"
      note="Keep labels visible. Associate validation messages with the field that needs attention."
    >
      <form class="library-form" novalidate @submit.prevent="validate">
        <label for="example-email"
          >Email address<input
            id="example-email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            :aria-invalid="!!error"
            aria-describedby="example-email-help"
          /><small id="example-email-help" :class="{ 'field-error': error }" aria-live="polite">{{
            error || 'Example only. This form does not send data.'
          }}</small></label
        ><LibraryButton type="submit" variant="secondary">Validate</LibraryButton>
      </form>
      <div class="specimen-grid">
        <label>Read-only value<input value="bloom-library" readonly /></label
        ><label>Disabled field<input value="Not available" disabled /></label
        ><label class="span-full"
          >Notes<textarea
            v-model="notes"
            rows="3"
            placeholder="Add component notes"
            maxlength="240"
          ></textarea
          ><small>{{ notes.length }} / 240 characters</small></label
        >
      </div>
    </SpecimenSection>
    <div class="specimen-columns">
      <SpecimenSection
        title="Select"
        note="Choose with the pointer or use arrow keys, Home, End, and Enter."
        ><label
          >Density<BloomSelect v-model="density">
            <option>Comfortable</option>
            <option>Compact</option>
            <option>Spacious</option>
          </BloomSelect></label
        >
        <p class="selection-readout">Selected: {{ density }}</p></SpecimenSection
      >
      <SpecimenSection
        title="Checkboxes"
        note="Independent selections; more than one option may be enabled."
        ><div class="control-stack">
          <label class="choice-label"
            ><input v-model="checked" type="checkbox" />Include documentation</label
          ><label class="choice-label"
            ><input type="checkbox" disabled />Include source maps (unavailable)</label
          >
        </div></SpecimenSection
      >
      <SpecimenSection title="Radio group" note="Mutually exclusive options share one group name."
        ><fieldset class="control-stack">
          <legend>Visibility</legend>
          <label v-for="value in ['Private', 'Team', 'Public']" :key="value" class="choice-label"
            ><input v-model="option" type="radio" name="example-visibility" :value="value" />{{
              value
            }}</label
          >
        </fieldset></SpecimenSection
      >
      <SpecimenSection
        title="Switches"
        note="Changes apply immediately. Use a checkbox when submission is required."
        ><div class="control-stack">
          <LibrarySwitch v-model="enabled" label="Show component labels" /><LibrarySwitch
            v-model="disabledSwitch"
            label="Sync across devices"
            disabled
          /></div
      ></SpecimenSection>
    </div>
    <SpecimenSection
      title="Tabs"
      note="Arrow keys move between tabs; Home and End select the first and last."
      ><div class="library-tabs" role="tablist" aria-label="Component information">
        <button
          v-for="(label, index) in tabs"
          :id="`example-tab-${index}`"
          :key="label"
          role="tab"
          :aria-selected="tab === label"
          :aria-controls="`example-panel-${index}`"
          :tabindex="tab === label ? 0 : -1"
          @click="tab = label"
          @keydown="changeTab($event, index)"
        >
          {{ label }}
        </button>
      </div>
      <div
        v-for="(label, index) in tabs"
        v-show="tab === label"
        :id="`example-panel-${index}`"
        :key="label"
        class="library-tabpanel"
        role="tabpanel"
        :aria-labelledby="`example-tab-${index}`"
        tabindex="0"
      >
        <template v-if="label === 'Preview'"
          ><div class="specimen-row">
            <LibraryButton @click="emit('notify', 'Example applied')">Apply</LibraryButton
            ><LibraryButton variant="secondary" @click="emit('notify', 'Example reset')"
              >Reset</LibraryButton
            >
          </div></template
        ><template v-else-if="label === 'Properties'"
          ><code>variant: primary | secondary | quiet | danger</code></template
        ><template v-else>Use tabs for related views within the same context.</template>
      </div></SpecimenSection
    >
    <SpecimenSection
      title="Accordion"
      note="Disclosure sections reveal optional detail. Each section can be opened independently."
      ><details class="library-disclosure">
        <summary>When should I use an accordion?</summary>
        <p>
          For supporting information that people can choose to read. Keep essential actions visible.
        </p>
      </details>
      <details class="library-disclosure">
        <summary>How does keyboard navigation work?</summary>
        <p>Tab focuses each summary. Enter or Space opens and closes its section.</p>
      </details></SpecimenSection
    >
    <div class="specimen-columns">
      <SpecimenSection
        title="Badges"
        note="Status is expressed in text, with color as a supporting cue."
        ><div class="specimen-row">
          <span class="library-badge">Draft</span
          ><span class="library-badge success"><Check :size="13" />Ready</span
          ><span class="library-badge warning">Needs review</span
          ><span class="library-badge danger">Deprecated</span>
        </div></SpecimenSection
      >
      <SpecimenSection
        title="Avatars"
        note="Initials provide a fallback when a profile image is unavailable."
        ><div class="specimen-row">
          <span class="library-avatar" role="img" aria-label="Alex Kim">AK</span
          ><span class="library-avatar muted-avatar" role="img" aria-label="Jamie Lee">JL</span
          ><span class="library-avatar small-avatar" role="img" aria-label="Morgan Ray">MR</span>
        </div></SpecimenSection
      >
    </div>
    <SpecimenSection
      title="Alerts"
      note="Use inline alerts for information that stays relevant to the current task."
      ><div v-if="alertVisible" class="library-alert" role="status">
        <Info :size="18" />
        <div>
          <strong>Unsaved changes</strong>
          <p>Your edits are stored in this browser. Export a copy to use them elsewhere.</p>
        </div>
        <button
          class="icon-button"
          aria-label="Dismiss example alert"
          @click="alertVisible = false"
        >
          <X :size="18" />
        </button>
      </div>
      <LibraryButton v-else variant="secondary" @click="alertVisible = true"
        >Show alert</LibraryButton
      >
      <div class="library-alert error-alert">
        <AlertCircle :size="18" />
        <div>
          <strong>Import could not be completed</strong>
          <p>Check the file format and try again.</p>
        </div>
      </div></SpecimenSection
    >
    <div class="specimen-columns">
      <SpecimenSection title="Progress" note="Show a value when completion can be measured."
        ><label
          >Upload progress <input v-model.number="progress" type="range" min="0" max="100" /></label
        ><progress :value="progress" max="100" aria-label="Example upload progress"></progress>
        <p class="selection-readout" aria-live="polite">
          {{ progress }}% complete
        </p></SpecimenSection
      >
      <SpecimenSection
        title="Dialog"
        note="Dialogs trap focus, close with Escape, and return focus to their trigger."
        ><LibraryButton variant="secondary" @click="dialogOpen = true"
          >Open dialog</LibraryButton
        ></SpecimenSection
      >
    </div>
    <SpecimenSection
      title="Table"
      note="Select individual rows or the whole set. Sort by the component name."
      ><div class="library-table-wrap">
        <table class="library-table">
          <caption>
            Component inventory ·
            {{
              selectedRows.length
            }}
            selected
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <input
                  v-model="allRows"
                  type="checkbox"
                  :indeterminate="selectedRows.length > 0 && !allRows"
                  aria-label="Select all components"
                />
              </th>
              <th scope="col" :aria-sort="ascending ? 'ascending' : 'descending'">
                <button @click="ascending = !ascending">
                  Component <ArrowUpDown :size="14" />
                </button>
              </th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.name">
              <td>
                <input
                  v-model="selectedRows"
                  type="checkbox"
                  :value="row.name"
                  :aria-label="`Select ${row.name}`"
                />
              </td>
              <th scope="row">{{ row.name }}</th>
              <td>{{ row.category }}</td>
              <td>{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div></SpecimenSection
    >
    <LibraryDialog
      v-model="dialogOpen"
      title="Remove this example?"
      description="This demonstrates a confirmation dialog. Your design system will not be changed."
      ><div class="dialog-actions">
        <LibraryButton variant="secondary" @click="dialogOpen = false">Cancel</LibraryButton
        ><LibraryButton variant="danger" @click="confirmExample">Remove example</LibraryButton>
      </div></LibraryDialog
    >
  </div>
</template>
