// src/App.jsx
import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import {
  Authenticator,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient({ authMode: "userPool" });

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    client.models.Note.observeQuery().subscribe({
      next: ({ items }) => {
        setNotes(items);
      },
      error: (err) => console.error("observeQuery error:", err),
    });
    
  }, []);

  async function createNote(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name");
    const image = data.get("image"); // if the tutorial includes file upload

    await client.models.Note.create({
      name,
      image, 
    });

    event.currentTarget.reset();
  }

  async function deleteNote(note) {
    await client.models.Note.delete({ id: note.id });
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex direction="column" alignItems="center" gap="1.5rem" padding="2rem">
          <Heading level={1}>Notes App</Heading>

          <View as="form" margin="1.5rem 0" onSubmit={createNote}>
            <Flex direction="column" gap="1rem">
              <TextField name="name" placeholder="Note title" label="Note title" labelHidden variation="quiet" required />
              {/* If image upload is part of it, a file input might be included here */}
              <Button type="submit" variation="primary">Create Note</Button>
            </Flex>
          </View>

          <Divider />

          <Heading level={2}>Your Notes</Heading>
          <Flex direction="column" gap="1rem">
            {notes.map((note) => (
              <Flex key={note.id} direction="column" border="1px solid #ccc" padding="1rem" borderRadius="0.5rem">
                <Text>{note.name}</Text>
                {note.image && <img src={note.image} alt={note.name} style={{ maxWidth: "200px" }} />}
                <Button variation="destructive" onClick={() => deleteNote(note)}>
                  Delete Note
                </Button>
              </Flex>
            ))}
          </Flex>

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}