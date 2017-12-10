<template>
  <div id="app">
    <a-scene>
      <a-assets>
        <!--<audio id="click-sound" src="audio/click.ogg"></audio>-->
        <!-- Images. -->
        <img id="city" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg">
        <img id="city-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-city.jpg">
        <img id="cubes" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg">
        <img id="cubes-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-cubes.jpg">
        <img id="sechelt" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg">
        <img id="sechelt-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-sechelt.jpg">
      </a-assets>
      <!-- 360-degree image. -->
      <a-sky id="image-360" radius="10" ref="sky"
             :src="`#${sky}`"
             v-animation="fade"></a-sky>

      <!-- Link we will build. -->
      <template v-for="(thumb, i) in thumbs">
        <entity @click.native="change(thumb)"
        v-animation="hover"
        :geometry="geometry"
        :material="{shader: 'flat', src: `#${thumb}`}"
        :position="{x:i*2, y: 0, z: -4}"></entity>
      </template>
      <!-- Camera + Cursor. -->
      <a-camera>
        <a-cursor id="cursor">
          <a-animation begin="click" easing="ease-in" attribute="scale"
                       fill="backwards" from="0.1 0.1 0.1" to="1 1 1" dur="150"></a-animation>
          <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
                       from="1 1 1" to="0.1 0.1 0.1" dur="1500"></a-animation>
        </a-cursor>
      </a-camera>
    </a-scene>
  </div>
</template>

<script>
  import Entity from './Entity.vue';

  const createAframeAnimation = function (attributes) {
    const el = document.createElement('a-animation');
    Object.keys(attributes).map(key => {
      const attr = AFRAME.utils.coordinates.stringify(attributes[key]);
      el.setAttribute(key, attr);
    });

    return el
  };

  export default {
    name: 'app',
    components: {
      entity: Entity
    },
    directives: {
      animation: {
        bind(el, binding) {
          let _value = binding.value;
          if (!Array.isArray(_value)) {
            _value = [_value];
          }
          _value.map(attributes => {
            const animeEl = createAframeAnimation(attributes);
            el.appendChild(animeEl);
          });
        },
        unbind(el) {
          el.querySelectorAll('a-animation').forEach(animation => {
            el.removeChild(animation);
          });
        }
      }
    },
    data() {
      return {
        geometry: {
          primitive: "plane", height: 1, width: 1
        },
        hover: [
          {begin: "mouseenter", attribute: "scale", to: {x: 1.2, y: 1.2, z: 1.0}},
          {begin: "mouseleave", attribute: "scale", to: {x: 1.0, y: 1.0, z: 1.0}}
        ],
        fade: {
          begin: "image-fade",
          attribute: "material.color",
          direction: "alternate",
          from: "#FFF", to: "#000", dur: 300
        },
        thumbs: [
          "city-thumb",
          "cubes-thumb",
          "sechelt-thumb"
        ],
        sky: "city"
      }
    },
    methods: {
      change(id) {
        const imageId = id.replace(/-thumb/, "");
        const skyEl = this.$refs.sky;
        console.log(skyEl);
        skyEl.emit('image-fade');
        setTimeout(()=>{
          this.sky = imageId;
          skyEl.emit('image-fade');
          console.log("hoge");
        }, this.fade.dur + 100);
      }
    }
  }
</script>

<style lang="scss">
</style>
