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
  <a-entity class="link"></a-entity>
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
