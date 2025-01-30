import { fillTags, Reactive, Component, If } from "./lib.min.js";

fillTags(window);

const counter = Reactive(1, "counter");

window.color = Reactive("black", "color");

class RandomWord extends Component {
  constructor() {
    super(() =>
      p(
        { onclick: () => (this.word.value = this.getRandomWord()) },
        () => this.word.value
      )
    );
    this.word = new Reactive(this.getRandomWord());
  }

  getRandomWord() {
    let words =
      "lorem ipsum dolor sit amet consectetur adipisicing elit quasi accusamus amet cumque nemo molestiae sunt quidem quibusdam qui assumenda rerum nisi repudiandae voluptates aliquid quisquam exercitationem laboriosam molestias placeat sit".split(
        " "
      );
    return words[Math.floor(Math.random() * words.length)];
  }
}

const App = new Component(() =>
  div(
    h1("Counter"),
    button({ onclick: () => counter.value-- }, "-"),
    "Value: ",
    () => counter.value,
    button({ onclick: () => counter.value++ }, "+"),
    new If(
      () => counter.value > 0,
      () => p({ style: () => `color:${color.value}` }, "Value is positive"),
      () => div(p("Random word is:"), new RandomWord())
    )
  )
);
App.mountTo(document.body);
