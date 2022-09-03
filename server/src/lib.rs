use serde::{Deserialize, Serialize};

#[cfg(test)]
mod test;

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum Kind {
    #[serde(rename = "css")]
    Css,
    #[serde(rename = "innerHTML")]
    InnerHTML,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum Selector {
    #[serde(rename = "css")]
    Css { value: String },
    #[serde(rename = "innerHTML")]
    InnerHTML { value: String },
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Book {
    pub name: String,
    pub url: String,
    pub content: Selector,
    pub next: Selector,
    pub prev: Selector,
    pub blacklist: Vec<Selector>,
}
