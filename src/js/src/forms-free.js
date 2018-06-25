/* FORMS */
(($) => {
  $(document).ready(() => {

    // Text based inputs
    const input_selector = `${['text', 'password', 'email', 'url', 'tel', 'number', 'search', 'search-md']
      .map((selector) => `input[type=${selector}]`)
      .join(', ')}, textarea`

    const text_area_selector = '.materialize-textarea'

    const update_text_fields = ($input) => {

      const $labelAndIcon  = $input.siblings('label, i')
      const hasValue       = $input.val().length
      const hasPlaceholder = $input.attr('placeholder')
      // let isValid     = $input.validity.badInput === true;
      const addOrRemove    = `${hasValue || hasPlaceholder ? 'add' : 'remove'}Class`

      $labelAndIcon[addOrRemove]('active')

    }

    const validate_field = ($input) => {

      if ($input.hasClass('validate')) {
        const value   = $input.val()
        const noValue = !value.length
        const isValid = !$input[0].validity.badInput

        if (noValue && isValid) {
          $input.removeClass('valid').removeClass('invalid')
        } else {
          const valid  = $input.is(':valid')
          const length = Number($input.attr('length')) || 0

          if (valid && (!length || length > value.length)) {
            $input.removeClass('invalid').addClass('valid')
          } else {
            $input.removeClass('valid').addClass('invalid')
          }

        }

      }

    }

    const textarea_auto_resize = () => {

      const $textarea  = $(this)
      if ($textarea.val().length) {
        const $hiddenDiv = $('.hiddendiv')
        const fontFamily = $textarea.css('font-family')
        const fontSize   = $textarea.css('font-size')

        if (fontSize) {
          $hiddenDiv.css('font-size', fontSize)
        }
        if (fontFamily) {
          $hiddenDiv.css('font-family', fontFamily)
        }
        if ($textarea.attr('wrap') === 'off') {
          $hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre')
        }


        $hiddenDiv.text(`${$textarea.val()}\n`)
        const content = $hiddenDiv.html().replace(/\n/g, '<br>')
        $hiddenDiv.html(content)

        // When textarea is hidden, width goes crazy.
        // Approximate with half of window size
        $hiddenDiv.css('width', $textarea.is(':visible') ? $textarea.width() : $(window).width() / 2)
        $textarea.css('height', $hiddenDiv.height())
      }

    }

    // Set active on labels and icons (DOM ready scope);
    $(input_selector).each((index, input) => {
      const $this          = $(input)
      const $labelAndIcon  = $this.siblings('label, i')
      update_text_fields($this)
      const isValid        = input.validity.badInput // pure js
      if (isValid) {
        $labelAndIcon.addClass('active')
      }
    })

    // Add active when element has focus
    $(document).on('focus', input_selector, (e) => {
      $(e.target).siblings('label, i').addClass('active')
    })

    // Remove active on blur when not needed or invalid
    $(document).on('blur', input_selector, (e) => {
      const $this         = $(e.target)
      const noValue       = !$this.val()
      const invalid       = !e.target.validity.badInput
      const noPlaceholder = $this.attr('placeholder') === undefined

      if (noValue && invalid && noPlaceholder) {
        $this.siblings('label, i').removeClass('active')
      }

      validate_field($this)
    })

    // Add active if form auto complete
    $(document).on('change', input_selector, (e) => {
      const $this = $(e.target)
      update_text_fields($this)
      validate_field($this)
    })

    // Handle HTML5 autofocus
    $('input[autofocus]').siblings('label, i').addClass('active')

    // HTML form reset
    $(document).on('reset', (e) => {
      const $formReset = $(e.target)
      if ($formReset.is('form')) {

        const $formInputs = $formReset.find(input_selector)
        // Reset inputs
        $formInputs
          .removeClass('valid')
          .removeClass('invalid')
          .each((index, input) => {
            const $this          = $(input)
            const noDefaultValue = !$this.val()
            const noPlaceholder  = !$this.attr('placeholder')
            if (noDefaultValue && noPlaceholder) {
              $this.siblings('label, i').removeClass('active')
            }
          })

        // Reset select
        $formReset.find('select.initialized').each((index, select) => {
          const $select        = $(select)
          const $visible_input = $select.siblings('input.select-dropdown')
          const default_value  = $select.children('[selected]').val()

          $select.val(default_value)
          $visible_input.val(default_value)
        })
      }
    })

    // Textarea auto extend
    if($('.md-textarea-auto').length) {
      var observe;
      if (window.attachEvent) {
        observe = function (element, event, handler) {
          element.attachEvent('on'+event, handler);
        };
      }
      else {
        observe = function (element, event, handler) {
          element.addEventListener(event, handler, false);
        };
      }

      function init() {
        var text = $('.md-textarea-auto');
        text.each(function() {
          let _this = this;
          function resize () {
            _this.style.height = 'auto';
            _this.style.height = _this.scrollHeight+'px';
          }
          /* 0-timeout to get the already changed text */
          function delayedResize () {
            window.setTimeout(resize, 0);
          }
          observe(_this, 'change',  resize);
          observe(_this, 'cut',     delayedResize);
          observe(_this, 'paste',   delayedResize);
          observe(_this, 'drop',    delayedResize);
          observe(_this, 'keydown', delayedResize);
          resize();
        })
      }
      init();
    }

    // Textarea Auto Resize
    if (!$('.hiddendiv').first().length) {
      const $hiddenDiv = $('<div class="hiddendiv common"></div>')
      $('body').append($hiddenDiv)
    }

    $(text_area_selector).each(textarea_auto_resize)
    $('body').on('keyup keydown', text_area_selector, textarea_auto_resize)

  })

})(jQuery)
