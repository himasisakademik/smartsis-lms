const { createClient } = require('@sanity/client');

const projectId = '2vmlrlyf';
const dataset = 'production';

// Client WITHOUT token
const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-11-27',
  useCdn: false,
});

async function main() {
  console.log('Checking if dataset is public without a token...');
  try {
    const result = await client.fetch('*[_type == "course"]{ _id, title }');
    console.log('Success! Dataset is PUBLIC. Courses found:', result.length);
  } catch (err) {
    console.log('Error (Dataset is likely PRIVATE or requires auth):', err.message);
  }
}

main();
