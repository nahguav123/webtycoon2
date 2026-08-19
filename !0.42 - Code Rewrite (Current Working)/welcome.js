// Starts a throwaway local account so someone can try the game with no
// registration. Swap this for a real "guest session" endpoint later.

async function playNowGuest() {
  // Load the database to get the next user ID.
  const db = LocalStore.read();
  // Create a guest account name using the next available user ID.
  const guestName = 'guest_' + db.nextUserId;

  try {
    await GameAPI.register({
      username: guestName,
      email: `${guestName}@guest.local`,
      password: guestName
    });
    const { token } = await GameAPI.login({ username: guestName, password: guestName });
    localStorage.setItem('token', token);
    window.location = 'websites.html';
  } catch (err) {
    alert('Could not start a guest game: ' + err.message);
  }
}