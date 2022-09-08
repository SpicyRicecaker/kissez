use html5ever::{parse_document, tendril::TendrilSink, tree_builder::TreeBuilderOpts, ParseOpts};
use markup5ever_rcdom::{Handle, NodeData, RcDom};

use crate::*;

#[test]
fn serde_exports() {
    let book: Book = serde_json::from_str(
        r#"
  {"name":"LOCALHOSTTEST","url":"http://localhost:8080/bob.html","content":{"value":".content","type":"css"},"next":{"value":"Next:","type":"innerText"},"prev":{"value":"Prev:","type":"innerText"},"blacklist":[{"value":".simplesocialbuttons","type":"css"}]}
"#,
    )
    .unwrap();

    assert_eq!(
        book,
        Book {
            name: String::from("LOCALHOSTTEST"),
            url: String::from("http://localhost:8080/bob.html"),
            content: Selector::Css {
                value: String::from(".content"),
            },
            next: Selector::InnerText {
                value: String::from("Next:"),
            },
            prev: Selector::InnerText {
                value: String::from("Prev:"),
            },
            blacklist: vec![Selector::Css {
                value: String::from(".simplesocialbuttons"),
            }]
        }
    )
}

fn walk(handle: &Handle, indent: u8, res: &mut String) {
    let node = handle;
    for _ in 0..indent {
        res.push(' ');
    }

    match node.data {
        // if it's document simply add children
        NodeData::Document => {
            for child in node.children.borrow().iter() {
                walk(child, 0, res);
            }
        }
        NodeData::Element {
            ref name,
            ref attrs,
            ..
        } => {
            res.push('<');
            res.push_str(&name.local);
            for attr in attrs.borrow().iter() {
                res.push(' ');
                res.push_str(&attr.name.local);
                res.push_str("=\"");
                res.push_str(&attr.value);
                res.push('"');
            }
            res.push('>');
            // res.push('\n');
            for child in node.children.borrow().iter() {
                walk(child, indent + 4, res);
            }
            res.push_str("</");
            res.push_str(&name.local);
            res.push('>');
        }
        // I'm not sure what this means
        NodeData::Text { ref contents } => {
            res.push_str(&contents.borrow());
        }
        _ => {}
    }
}

#[test]
fn basic_inner_test() {
    let html = r#"<div><div>hello world</div><div>goodbye world</div></div>"#.to_string();

    let opts = ParseOpts {
        tree_builder: TreeBuilderOpts {
            drop_doctype: true,
            ..Default::default()
        },
        ..Default::default()
    };
    let dom = parse_document(RcDom::default(), opts)
        .from_utf8()
        .read_from(&mut html.as_bytes())
        .unwrap();

    let mut res = String::new();
    walk(&dom.document, 0, &mut res);

    assert_eq!(
        res,
        r##"<div>
    <div>hello world</div>
    <div>goodbye world</div>
</div>
    "##
    );
}
