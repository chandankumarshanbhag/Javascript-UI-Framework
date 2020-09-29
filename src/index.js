class Framework {
    constructor() {
        this.createDOMTree == this.createDOMTree.bind(this)
        this.render = this.render.bind(this)
        this.renderTree = this.renderTree.bind(this)
    }
    render(el, component) {
        if (el && component) {
            let tree = this.createDOMTree(component);
            console.log(tree)
            el.appendChild(this.renderTree(tree));
        }
    }
    renderTree(tree) {
        if (tree.children) {
            if (Array.isArray(tree.children)) {
                tree.children.map(x => {
                    return this.renderTree(x);
                }).forEach(x => tree.$el.appendChild(x))
            }
            else if (typeof tree.children == "string") {
                tree.$el.innerText = tree.children;
            }
            else {
                tree.$el.appendChild(this.renderTree(tree.children))
            }
        }
        return tree.$el;
    }
    createDOMTree(component) {
        let tree = {};
        if (typeof component == "object" && component.hasChildren && component.hasChildren()) {
            if (Array.isArray(component.children)) {
                tree.children = component.children.map(x => this.createDOMTree(x))
            }
            else {
                tree.children = this.createDOMTree(component.children)
            }
        }
        else if (typeof component == "string") {
            tree.children = component.children;
        }
        let node = createElement(component);
        if (typeof node == "string") {
            return node;
        }
        else {
            tree.$el = node;
        }
        component.$root = tree.$el;
        return tree;
    }
}


class Component {
    constructor(opns = {}) {
        Object.keys(opns).forEach(key => {
            this[key] = opns[key];
        });
        // this.children = opns.children;
        // this.style = opns.style;
        this.ref = this.ref.bind(this);
        this.setState = this.setState.bind(this);
    }
    hasChildren() {
        return this.children != undefined && this.children != null;
    }
    ref() {

    }
    reload() {
        while (this.$root.firstChild) {
            this.$root.removeChild(this.$root.lastChild);
        }
        new Framework().render(this.$root, this.render());
    }
    setState(arg) {
        if (typeof arg == "function") {

        }
        else if (typeof arg == "object") {
            Object.keys(arg).forEach(key => {
                this.state[key] = arg[key];
            })
            this.reload();
            this.componentDidUpdate();
        }
    }
    componentDidMount() { }
    componentWillMount() { }
    componentDidUpdate() { }
}

class Div extends Component {
    selector = "div"
    constructor(props) {
        super(props);
    }
}
class Button extends Component {
    selector = "button"
    constructor(props) {
        super(props);
    }
}
class Input extends Component {
    selector = "input"
    constructor(props) {
        super(props);
    }
}

class MyCustomComponent extends Component {
    selector = "my-custom-component"
    constructor(props) {
        super(props);
        this.state = {
            value: 10,
            input: ""
        }
    }
    componentWillMount() {
        console.log("component will mount");
    }
    componentDidMount() {
        console.log("component did mount");
    }
    render() {
        return new Div({
            children: [
                new Button({
                    children: "Click me",
                    onclick: () => {
                        console.log("clicked")
                        this.setState({ value: this.state.value + 1 })
                    }
                }),
                new Input({
                    type: "number",
                    defaultValue: this.state.input,
                    onkeyup: ({ target: { value } }) => {
                        console.log(value)
                        this.setState({ input: value });
                    }
                }),
                new Div({
                    children: "This is my custom component " + this.state.value
                }),
                new Div({
                    children: this.state.input
                })
            ]
        })
    }
}


function createElement(component) {
    if (typeof component == "string") {
        return component;
    }
    let element = document.createElement(component.selector || "div");
    if (component.render) {
        component.componentWillMount()
        new Framework().render(element, component.render());
        component.componentDidMount()
    }
    else {
        Object.keys(component).forEach(key => {
            element[key] = component[key];
        });
        if (typeof component.style == "object") {
            Object.keys(component.style).forEach(key => {
                element.style[key] = component.style[key];
            })
        }

    }

    return element;
}



new Framework().render(document.querySelector("#root"),
    new Div({
        children: [
            new Div({
                children: new Div({
                    children: "hello",
                    style: { fontSize: "100px" }
                })
            }),
            new Div({
                children: new MyCustomComponent({
                    abc: 10,
                    child: new Div({ children: "Children" })
                })
            })
        ],
    })
)