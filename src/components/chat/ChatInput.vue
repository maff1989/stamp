<template>
  <div class="row">
    <q-toolbar class="q-px-sm">
      <q-btn
        dense
        flat
        icon="unfold_more"
      >
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              clickable
              v-close-popup
              @click="giveLotusClicked"
            >
              <q-item-section
                avatar
                side
              >
                <q-icon name="local_florist" />
              </q-item-section>
              <q-item-section>
                Give Lotus Secretly
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="sendFileClicked"
            >
              <q-item-section
                avatar
                side
              >
                <q-icon name="attach_file" />
              </q-item-section>
              <q-item-section>
                Attach Image
              </q-item-section>
            </q-item>

            <!-- <q-item clickable>
              <q-item-section avatar>
                <q-icon name="insert_emoticon" />
              </q-item-section>
              <q-item-section>
                Insert Emoji
              </q-item-section>
              <q-menu self="center middle">
                <picker
                  v-close-popup
                  :data="emojiIndex"
                  set="twitter"
                  @select="addEmoji"
                  :title="$t('chatInput.emojiPickerTitle')"
                  :show-skin-tones="false"
                />
              </q-menu>
            </q-item> -->
            <q-item>
              <q-item-section>
                <q-input
                  dense
                  outlined
                  style="width: 150px"
                  label="Stamp Price"
                  suffix="XPI"
                  v-model="innerStampAmount"
                  input-class="text-right"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <!-- <q-separator vertical /> -->
      <q-input
        ref="inputBox"
        class="full-width q-pl-md"
        dense
        borderless
        autogrow
        autofocus
        @keydown.enter.exact.prevent
        @keydown.enter.exact="sendMessage"
        @mousedown.self.stop
        v-model="innerMessage"
        :placeholder="$t('chatInput.placeHolder')"
      />
      <q-space />
      <q-btn
        dense
        flat
        class="q-btn q-pa-sm"
        @mousedown.prevent="sendMessage"
      >
        <q-icon name="send" />
      </q-btn>
    </q-toolbar>
  </div>
</template>

<script>
import emoji from 'node-emoji'
// import { Picker, EmojiIndex } from 'emoji-mart-vue-fast'
// import data from '../../assets/emoticons/all.json'
// import 'emoji-mart-vue-fast/css/emoji-mart.css'
import { defaultStampAmount } from '../../utils/constants'

// const emojiIndex = new EmojiIndex(data)

export default {
  components: {
    // Picker
  },
  data () {
    return {
      // emojiIndex
    }
  },
  props: {
    message: {
      type: String,
      default: () => ''
    },
    stampAmount: {
      type: Number,
      default: () => defaultStampAmount
    }
  },
  emits: ['update:message', 'update:stampAmount', 'sendMessage', 'giveLotusClicked', 'sendFileClicked'],
  methods: {
    focus () {
      this.$refs.inputBox.focus()
    },
    sendMessage () {
      this.$emit('sendMessage', this.innerMessage)
    },
    giveLotusClicked () {
      this.$emit('giveLotusClicked')
    },
    sendFileClicked () {
      this.$emit('sendFileClicked')
    },
    addEmoji (value) {
      // TODO: This needs to be cursor position aware
      this.innerMessage += `:${value.id}:`
    }
  },
  computed: {
    innerMessage: {
      get () {
        return this.message
      },
      set (val) {
        const replacer = (match) => emoji.emojify(match)
        // TODO: Remove emojify
        const emojifiedValue = val.replace(/(:.*:)/g, replacer)
        this.$emit('update:message', emojifiedValue)
      }
    },
    innerStampAmount: {
      get () {
        return Number(this.stampAmount / 1000000).toFixed(2)
      },
      set (val) {
        this.$emit('update:stampAmount', Number(val) * 1000000)
      }
    }
  }
}
</script>
