import { useRef, useState } from "react"
import Button from "./components/Button"
import ColorSchemeSwitcher from "./components/ColorSchemeSwitcher"
import Modal from "./components/Elements/Modal"
import ModalButton from "./components/Elements/ModalButton"
import NavBar from "./components/Elements/NavBar"
import CheckboxGroup from "./components/Form/CheckboxGroup"
import Form from "./components/Form/Form"
import Input from "./components/Form/Input"
import Select from "./components/Form/Select"
import Submit from "./components/Form/Submit"
import Textarea from "./components/Form/Textarea"
import Container from "./components/Layout/Container"
import Grid from "./components/Layout/Grid"
import Header from "./components/Layout/Header"
import Heading from "./components/Layout/Heading"
import Main from "./components/Layout/Main"
import Tabs from "./components/Tabs"

import { ModalProvider } from "./contexts/ModalContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import RadioGroup from "./components/Form/RadioGroup"

function FormDemo(){
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<{
    name: string;
    email: string;
    face: string;
    faced: string;
    facer: string;
    select: string;
    one: string[];
    two: string;
  }>({
    name: "",
    email: "",
    face: "",
    faced: "",
    facer: "",
    select: "",
    one: [],
    two: '',
  });
  return(
    <Form onSubmit={(event) => {
      //@ts-ignore
      if(event.target.checkValidity()){
        event.preventDefault();
        alert(JSON.stringify(values, null, 2));
      }

    }}>
      <Grid>

        <Input type="text" name="name" label="Name"
        required={true}
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
        <Input type="email" name="email" label="Email" valid={true}
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
        />
      </Grid>
      <Input type="text" name="face" label="Face"  valid={false}
        value={values.face}
        onChange={(event) => setValues({ ...values, face: event.target.value })}
      />
      <Input type="text" name="faced" label="Disabled"  disabled={true}
        value={values.faced}
        onChange={(event) => setValues({ ...values, faced: event.target.value })}
      />
      <Input type="text" name="facer" label="Read Only" defaultValue="Read Only Example"  readOnly={true}
        ref={inputRef}
      />
      <Select name="select" label="Select"
        value={values.select}
        onChange={(event) => setValues({ ...values, select: event.target.value })}
        options={[
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
        ]}
       />
      <CheckboxGroup
          value={values.one}
          onChange={(update:string[]) => setValues({ ...values, one: update })}
          legend="Checkbox Group" options={[
          { name: "one", label: "One" },
          { name: "two", label: "Two" },
        ]}
      />
      <RadioGroup
          value={values.two}
          onChange={(update:string) => setValues({ ...values, two: update })}
          legend="Radio Group" options={[
          { name: "one", label: "One" },
          { name: "two", label: "Two" },
        ]}
      />
      <Submit value="Submit" />

    </Form>
  )
}
function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <ThemeProvider>
      <Container>
        <Header>
          <NavBar
            leftItems={[{
              children: <strong>Home</strong>,
              key: "home",
            }]}
            rightItems={[
              {
                children:       <ColorSchemeSwitcher className="contrast" />,
                key: "color-scheme-switcher",
              },
              {
                children: "About",
                key: "about",
                href: "/about",
              },
              {
                children: "Contact",
                key: "contact",
                href: "/contact",
              },
            ]}
          />
        </Header>
        <Main>
          <Heading level={1}>Picco</Heading>
          <Heading level={2}>Buttons</Heading>
          <Grid>
            <Button>Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="contrast">Contrast</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
          </Grid>
          <Heading level={3}>
            With Outline
          </Heading>
          <Grid>
            <Button>Default</Button>
            <Button variant="primary" outline>Primary</Button>
            <Button variant="secondary" outline>Secondary</Button>
            <Button variant="contrast" outline>Contrast</Button>
            <Button variant="success" outline>Success</Button>
            <Button variant="danger" outline>Danger</Button>
            <Button variant="warning" outline>Warning</Button>
          </Grid>
          <Heading level={2}>Modal</Heading>
          <ModalProvider>
            <ModalButton>Open Modal</ModalButton>
            <Modal
              title="Modal Title"
              cancelLabel="Cancel"
              confirmLabel="Submit"
            >
              <p>This is the modal content</p>
            </Modal>
          </ModalProvider>
          <Heading level={2}>Form</Heading>
          <FormDemo />
          <Heading level={2}>Grid</Heading>
          <Grid>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
          </Grid>
          <Heading level={2}>Textarea</Heading>
          <Textarea
            defaultValue="Default Value"
            ref={textAreaRef}
          name="textarea" label="Textarea" placeholder="Write Some Stuff" />
          <Heading level={2}>Fieldset</Heading>
          <form>
            <fieldset role="group">
              <input name="email" type="email" placeholder="Enter your email" autoComplete="email" />
              <input type="submit" value="Subscribe" />
            </fieldset>
          </form>
          <section>
            <Heading level={2}>Headings</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Heading level={4}>Heading 4</Heading>
            <Heading level={5}>Heading 5</Heading>
            <Heading level={6}>Heading 6</Heading>
          </section>
          <Heading level={2}>Tabs</Heading>
          <Tabs
            tabs={[
              {
                id: "one",
                content: <p>Tab One</p>,
                label: "One",
              },
              {
                id: "two",
                content: <div>
                  <p>Tab Two</p>
                  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover </p>
                </div>,
                label: "Two",
              },
              {
                id: "three",
                content: <p>Tab Three</p>,
                label: "Three",
              }
            ]}
          />
                    <section>

          <Heading level={2}>Colors</Heading>
            <div className="bg-primary m-8 p-4">Primary</div>
            <div className="bg-secondary m-8 p-4">Secondary</div>
            <div className="bg-contrast m-8 p-4">Contrast</div>
            <div className="bg-info m-8 p-4">Info</div>
            <div className="bg-success m-8 p-4">Success</div>
            <div className="bg-warning m-8 p-4">Warning</div>
            <div className="bg-danger m-8 p-4">Danger</div>

          </section>
          <section></section>
          <Heading level={3}>
            With Outline
          </Heading>
            <div className="bg-primary m-8 p-4 outline">Primary</div>
            <div className="bg-secondary m-8 p-4 outline">Secondary</div>
            <div className="bg-contrast m-8 p-4 outline">Contrast</div>
            <div className="bg-info m-8 p-4 outline">Info</div>
            <div className="bg-success m-8 p-4 outline">Success</div>
            <div className="bg-warning m-8 p-4 outline">Warning</div>
            <div className="bg-danger m-8 p-4 outline">Danger</div>
        </Main>
      </Container>

  </ThemeProvider>
  )
}

export default App
