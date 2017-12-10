# aframe-vue

A-FRAMEをVue.jsを使って開発するサンプルを作りました。

A-FRAMEはMozillaが主となって開発しているWebVRを開発するためのフレームワークです。
React VRよりも先発のためか `aframe-xxx-component` という拡張ライブラリが豊富なことも魅力です。

イメージ

## aframe-reactはあるが、aframe-vueはない
豊富な拡張のなかにreactのコンポーネントとしてaframeを扱うaframe-reactはあるが、Vue.jsはありません。
ということで拡張ライブラリまでは行かずとも、A-FRAMEをVue.jsで利用した場合のサンプルのようなものをつくってみました。

## 流れ
A-FRAMEにある`Building a 360° Image Gallery`というサンプルアプリケーションをVue.js仕様に書き換えて実装していこうと思います。

1. Vue.jsのコンポーネント内でA-FRAMEを動かす
2. EntityをVueコンポーネント化し、v-bindをつかってEntityを配置する
3. カスタムディレクティブを使いhoverアニメーションを実装する
4. 背景の切り替えアニメーションを実装する

## Vue.jsのコンポーネント内でA-FRAMEを動かす
まずはA-FRAMEをVue.jsの中で動かします。
今回Vue.jsのプロジェクトのベースには[vuejs-templates/webpack-simple](https://github.com/vuejs-templates/webpack-simple)を利用しました。
こちらをベースに `yarn add aframe` した後、main.jsでimport、App.vueのtemplate内に最初の基本となるシーンを記述します。

```js:main.js
import 'aframe';
```

```html:App.vue
<!--App.vueのtemplate内に記述-->
<a-scene>
  <a-assets>
    <audio id="click-sound" src="audio/click.ogg"></audio>
    <!-- Images. -->
    <img id="city" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg">
    <img id="city-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-city.jpg">
    <img id="cubes" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg">
    <img id="cubes-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-cubes.jpg">
    <img id="sechelt" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg">
    <img id="sechelt-thumb" src="https://cdn.aframe.io/360-image-gallery-boilerplate/img/thumb-sechelt.jpg">
  </a-assets>
  <!-- 360-degree image. -->
  <a-sky id="image-360" radius="10" src="#city"></a-sky>
  <!-- Link we will build. -->
  <a-entity class="link" geometry="primitive: plane; height: 1; width: 1"
                  material="shader: flat; src: #cubes-thumb"
                  position="0 0 -5"></a-entity>
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
```

背景画像とサムネイルが1枚表示されると成功です。
A-FRAMEはVR世界の要素(Entity)をHTMLタグと同じ記述で書き込んで行くため、
Vueのテンプレートにもそのまま書き込むだけで利用することができました。非常に簡単です。

## EntityをVueコンポーネント化し、v-bindをつかってEntityを配置する
A-FRAMEの公式では以下の2つの拡張コンポーネントを使ってサムネイルを横並びに配置しています。
- [aframe-template-component](https://ngokevin.github.io/kframe/components/template/) テンプレートを使ってEntityを生成する拡張
- [aframe-layout-component](https://ngokevin.github.io/kframe/components/layout/) Entityをグリッド状に配置する拡張

これを拡張を利用せずにVue.jsの機能をつかってサムネイルを生成します。

```js:App.vue
...
data() {
  return {
    thumbs: [
      "city-thumb",
      "cubes-thumb",
      "sechelt-thumb"
    ]
  }
}
...
```

```html:App.vue
<template>
...
<a-entity v-for="(thumb,i) in thumbs" class="link" 
          geometry="primitive: plane; height: 1; width: 1"
          :material="`shader: flat; src: #${thumb}`"
          :position="`${1.5*i} 0 -5`">
...
</template>
```

これで拡張を利用することなく動的にサムネイルを並べることができました。
A-FRAMEではEntityに対しての設定をComponentとして定義していきます。定義にはElementに対して属性を記述する形式で実装します。
上記サンプルのようにHTMLの属性として渡す場合は文字列として定義を渡しますが、Vue.js内で利用する場合はわざわざ文字列に直すのはすこし面倒です。
なのでそれぞれオブジェクトのままデータを渡すことが出来るようVueコンポーネントとしてEntityを作成することにします。

### EntityのVueコンポーネントを作成する
今回はシンプルにgeometry,material,positionをpropsとして受取りEntityを生成するVueコンポーネントを作成します。

```js:Entity.vue
<template>
  <a-entity ref="entity"></a-entity>
</template>

<script>
  export default {
    props: {
      geometry: {
        type: Object,
        required: false,
        default: () => {}
      },
      material: {
        type: Object,
        required: false,
        default: () => {}
      },
      position: {
        type: Object,
        required: false,
        default: () => ( {x:0, y:0, z:0} )
      }
    },
    data() {
      return {
        entity: {}
      }
    },
    mounted() {
      this.entity = this.$refs.entity;
      this.updateAttribute('geometry', this.geometry);
      this.updateAttribute('material', this.material);
      this.updateAttribute('position', this.position);
    },
    watch: {
      geometry() {
        this.updateAttribute('geometry', this.geometry);
      },
      material() {
        this.updateAttribute('material', this.material);
      },
      position() {
        this.updateAttribute('position', this.position);
      }
    },
    methods: {
      updateAttribute(key, values) {
        this.entity.setAttribute(key, values);
      }
    }
  }
</script>
```

propsで参照している値を監視しsetAttributeで更新するシンプルなものですが、これでリアクティブにデータによって更新されるEntityが利用可能です。
A-FRAMEには[Util関数](https://aframe.io/docs/0.7.0/core/utils.html)が用意されているので本格的に開発するのであればもっと作り込みが必要かと思いますが、
今回はこれで事足りるためここまでにしておきます。

EntityにpropsとしてComponentを渡すことが出来るようになったのでApp.vueの記述が以下のように代わります。
```html:App.vue
<template>
...
<entity v-for="(thumb,i) in thumbs"
        v-animation="hover"
        :geometry="geometry"
        :material="{shader: 'flat', src: `#${thumb}`}"
        :position="{x:i*2, y: 0, z: -4}"></entity>
...
</template>

<script>
  import Entity from './Entity.vue';
...
    components: {
      entity: Entity
    },
    data() {
      return {
        geometry: {
          primitive: "plane", height: 1, width: 1
        },
        thumbs: [
          "city-thumb",
          "cubes-thumb",
          "sechelt-thumb"
        ]
      }
    }
...
</script>
```

今回はサムネイルを3つ並べるだけなのであまり意味がありませんが、VueのdataをそのままEntityにバインド出来るようになりました。
Vue.jsをあわせて利用することで2つ必要だった拡張をVueだけで実現できました。

次はアニメーションの実装です。

## カスタムディレクティブを使いhoverアニメーションを実装する
公式ではカーソルがサムネイルをホバーした時のアニメーションを拡張コンポーネントの
[aframe-event-set-component](https://ngokevin.github.io/kframe/components/event-set/)を使って実装しています。
これをVue.jsのカスタムディレクティブとA-FRAMEの `<a-animation>` を使って実現します。
基本的には定義したカスタムディレクティブ `animation` の処理でEntityに `<a-animation>` を子要素として追加しています。

```js:App.vue
...
  const createAframeAnimation = function (attributes) {
    const el = document.createElement('a-animation');
    Object.keys(attributes).map(key => {
      const attr = AFRAME.utils.coordinates.stringify(attributes[key]);
      el.setAttribute(key, attr);
    });

    return el
  };
...
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
      update(el, binding) {
        el.querySelectorAll('a-animation').forEach(animation => {
          el.removeChild(animation);
        });
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
      thumbs: [
        "city-thumb",
        "cubes-thumb",
        "sechelt-thumb"
      ]
    }
  },
...
```

```html:App.vue
<entity v-for="(thumb,i) in thumbs"
        v-animation="hover"
        :geometry="geometry"
        :material="{shader: 'flat', src: `#${thumb}`}"
        :position="{x:i*2, y: 0, z: -4}"></entity>

```

### 補足
実は上記サンプルではアニメーション設定に利用しているhoverの値を動的に書き換えても、書き換え以前のアニメーションも残ってしまいます。
これはA-FRAMEの `<a-animation>` がデータの更新に対応していないため。
Githubのissueにも上がっているので今後改善されるかもしれませんが、現状では一つひとつremoveEventListenerで消していくしかないようです。
参考リンク https://github.com/aframevr/aframe/issues/2650

## 背景の切り替えアニメーションを実装する
最後にサムネイルクリックで背景を切り替える処理を実装します。
公式では独自のComponentを定義して実装しています。
今回はそちらの実装をもとにVueのイベントディレクティブを使って実現しています。

```html:App.vue
...
  <a-sky ref="sky"
         id="image-360"
         radius="10"
         v-animation="fade"
         :src="`#${sky}`"></a-sky>
  <!-- Link we will build. -->
  <entity v-for="(thumb,i) in thumbs"
          @click.native="change(thumb)"
          v-animation="hover"
          :geometry="geometry"
          :material="{shader: 'flat', src: `#${thumb}`}"
          :position="{x:i*2, y: 0, z: -4}"></entity>
...
```

```js:App.vue
...
  data() {
    return {
      geometry: {
        primitive: "plane", height: 1, width: 1
      },
      hover: [
        {begin: "mouseenter", attribute: "scale", to: {x: 1.2, y: 1.2, z: 1.0}},
        {begin: "mouseleave", attribute: "scale", to: {x: 1.0, y: 1.0, z: 1.0}}
      ],
      thumbs: [
        "city-thumb",
        "cubes-thumb",
        "sechelt-thumb"
      ],
      fade: {
        begin: "image-fade",
        attribute: "material.color",
        direction: "alternate",
        from: "#FFF", to: "#000", dur: 300
      },
      sky: "city"
    }
  },
  methods: {
    change(id) {
      this.hover = [
        {begin: "mouseenter", attribute: "material.color", from: "#FFF", to: "#000"},
        {begin: "mouseleave", attribute: "material.color", from: "#000", to: "#FFF"}
      ];

      const imageId = id.replace(/-thumb/, "");
      const skyEl = this.$refs.sky;
      skyEl.emit('image-fade');
      setTimeout(()=>{
        this.sky = imageId;
        skyEl.emit('image-fade');
      }, this.fade.dur + 100);
    }
  }
...
```

setTimeoutのあたりが結構微妙ですが、、、
これでクリックするとfadeアニメーション後、背景画像を切り変えるアクションが実装できました。

## まとめ
A-FRAMEはWebVRをつくるときのハードルがかなり下がる素敵なフレームワークですが、
実際アプリケーションを開発するとなったときに通常のWeb開発で当たり前のものが単体だと結構面倒だったので
Vue.jsを合わせて利用することで作り込めばかなり本格的なWebVRサービスが作れるのではないかと思います。
今回はざっくりとした実装のサンプルなのでまだまだ足りない部分がありますが、A-FRAMEとVue.jsを合わせた開発の参考になれば幸いです。
