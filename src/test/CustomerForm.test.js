import React from "react";
import ReactTestUtils from "react-dom/test-utils";
import { createContainer } from "./domManipulators";
import { CustomerForm } from "../CustomerForm";

describe("CustomerForm", () => {
  // our manual spy
  const spy = () => {
    let receivedArguments;
    return {
      fn: (...args) => (receivedArguments = args),
      receivedArguments: () => receivedArguments,
      receivedArgument: n => receivedArguments[n]
    };
  };

  expect.extend({
    toHaveBeenCalled(received) {
      if (received.receivedArguments() === undefined) {
        return {
          pass: false,
          message: () => "Spy was not called"
        };
      }
      return { pass: true, message: () => "Spy was called" };
    }
  });

  let render, container;

  beforeEach(() => {
    ({ render, container } = createContainer());
  });

  const form = id => container.querySelector(`form[id="${id}"]`);
  const field = name => form("customer").elements[name];
  const labelFor = formElement =>
    container.querySelector(`label[for="${formElement}"]`);

  it("renders a form", () => {
    render(<CustomerForm />);
    expect(form("customer")).not.toBeNull();
  });

  it("has a submit button", () => {
    render(<CustomerForm />);
    const submitButton = container.querySelector('input[type="submit"]');
    expect(submitButton).not.toBeNull();
  });

  it("calls fetch with the right properties when submitting data", async () => {
    const fetchSpy = spy();
    render(<CustomerForm fetch={fetchSpy.fn} onSubmit={() => {}} />);
    ReactTestUtils.Simulate.submit(form("customer"));
    expect(fetchSpy).toHaveBeenCalled();
  });

  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual("INPUT");
    expect(formElement.type).toEqual("text");
  };

  const itRendersAsATextBox = fieldName =>
    it("renders as a text box", () => {
      render(<CustomerForm />);
      expectToBeInputFieldOfTypeText(field(fieldName));
    });

  const itIncludesTheExistingValue = fieldName =>
    it("includes the existing value", () => {
      render(<CustomerForm {...{ [fieldName]: "value" }} />);
      expect(field(fieldName).value).toEqual("value");
    });

  const itRendersALabel = (fieldName, text) =>
    it("renders a label", () => {
      render(<CustomerForm />);
      expect(labelFor(fieldName)).not.toBeNull();
      expect(labelFor(fieldName).textContent).toEqual(text);
    });

  const itAssignsAnIdThatMatchesTheLabelId = fieldName =>
    it("assigns an id that matches the label id", () => {
      render(<CustomerForm />);
      expect(field(fieldName).id).toEqual(fieldName);
    });

  const itSubmitsExistingValue = (fieldName, value) =>
    it("saves existing value when submitted", async () => {
      const submitSpy = spy();

      render(
        <CustomerForm {...{ [fieldName]: value }} onSubmit={submitSpy.fn} />
      );

      await ReactTestUtils.Simulate.submit(form("customer"));

      expect(submitSpy).toHaveBeenCalled();
      expect(submitSpy.receivedArgument(0)[fieldName]).toEqual(value);
    });

  const itSubmitsNewValue = (fieldName, value) =>
    it("saves new value when submitted", async () => {
      expect.hasAssertions();
      render(
        <CustomerForm
          {...{ [fieldName]: "existingValue" }}
          onSubmit={props => expect(props[fieldName]).toEqual(value)}
        />
      );
      await ReactTestUtils.Simulate.change(field(fieldName), {
        target: { value, name: fieldName }
      });
      await ReactTestUtils.Simulate.submit(form("customer"));
    });

  describe("first name field", () => {
    itRendersAsATextBox("firstName");
    itIncludesTheExistingValue("firstName");
    itRendersALabel("firstName", "First name");
    itAssignsAnIdThatMatchesTheLabelId("firstName");
    itSubmitsExistingValue("firstName", "value");
    itSubmitsNewValue("firstName", "newValue");
  });

  describe("last name field", () => {
    itRendersAsATextBox("lastName");
    itIncludesTheExistingValue("lastName");
    itRendersALabel("lastName", "Last name");
    itAssignsAnIdThatMatchesTheLabelId("lastName");
    itSubmitsExistingValue("lastName", "value");
    itSubmitsNewValue("lastName", "newValue");
  });

  describe("phone number field", () => {
    itRendersAsATextBox("phoneNumber");
    itIncludesTheExistingValue("phoneNumber");
    itRendersALabel("phoneNumber", "Phone number");
    itAssignsAnIdThatMatchesTheLabelId("phoneNumber");
    itSubmitsExistingValue("phoneNumber", "12345");
    itSubmitsNewValue("phoneNumber", "67890");
  });
});
