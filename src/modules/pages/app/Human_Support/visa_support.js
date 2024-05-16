export function render() {

    // const calendly_parent = document.querySelector('.calendly-embed');
    // Calendly.initInlineWidget({
    //     "url": 'https://calendly.com/worldify/1-1-visa-consultation',
    //     "parentElement": calendly_parent,
    //     "prefill": {},
    //     "utm": {}
    //   });

      window.addEventListener(
        'message',
        function(e) {
          if (isCalendlyEvent(e)) {
            console.log(e.data);
          }
        }
      );
}

function isCalendlyEvent(e) {
    return e.data.event &&
           e.data.event.indexOf('calendly') === 0;
  };
   
  
