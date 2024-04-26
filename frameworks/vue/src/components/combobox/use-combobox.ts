import type { CollectionOptions } from '@zag-js/combobox'
import * as combobox from '@zag-js/combobox'
import { type PropTypes, normalizeProps, useMachine } from '@zag-js/vue'
import { type ComputedRef, computed } from 'vue'
import { useEnvironmentContext } from '../../providers'
import type { CollectionItem, EmitFn, Optional } from '../../types'
import { useId } from '../../utils'
import type { RootEmits } from './combobox'

export interface UseComboboxProps<T extends CollectionItem>
  extends CollectionOptions<T>,
    Omit<Optional<combobox.Context<T>, 'id'>, 'collection' | 'open.controlled'> {
  modelValue?: combobox.Context<T>['value']
}

export interface UseComboboxReturn<T extends CollectionItem>
  extends ComputedRef<combobox.Api<PropTypes, T>> {}

export const useCombobox = <T extends CollectionItem>(
  props: UseComboboxProps<T>,
  emit: EmitFn<RootEmits>,
): UseComboboxReturn<T> => {
  const getRootNode = useEnvironmentContext()

  const context = computed(() => {
    const { items, itemToString, itemToValue, isItemDisabled, modelValue, ...rest } = props
    return {
      ...rest,
      collection: combobox.collection({ items, itemToString, itemToValue, isItemDisabled }),
      value: modelValue,
    }
  })

  const [state, send] = useMachine(
    combobox.machine({
      ...context.value,
      id: context.value.id ?? useId().value,
      getRootNode,
      'open.controlled': props.open !== undefined,
      onHighlightChange: (details) => {
        emit('highlightChange', details)
      },
      onInputValueChange: (details) => {
        emit('inputValueChange', details)
      },
      onOpenChange: (details) => {
        emit('openChange', details)
      },
      onValueChange: (details) => {
        emit('valueChange', details)
        emit('update:modelValue', details.value)
      },
    }),
    { context },
  )

  return computed(() => combobox.connect(state.value, send, normalizeProps))
}