import axios from 'axios';

export const addPlaceToOSM = async ({ name, description, latitude, longitude }) => {
  // XML format required by OSM for creating a new place
  const osmXml = `
    <osm>
      <node id="-1" lat="${latitude}" lon="${longitude}">
        <tag k="name" v="${name}" />
        <tag k="description" v="${description}" />
      </node>
    </osm>
  `;

  try {
    const response = await axios.post('https://api.openstreetmap.org/api/0.6/changeset/create', osmXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer YOUR_OSM_ACCESS_TOKEN`, 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding place to OSM:', error);
    throw new Error('Failed to add place to OSM');
  }
};
