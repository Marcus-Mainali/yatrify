const https = require('https');

function fetchCollection(collectionId) {
  return new Promise((resolve, reject) => {
    const url = `https://unsplash.com/collections/${collectionId}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const collectionIds = [
    '317099',  // Nature / Landscape
    '158643',  // Scenic
    '139386',  // Travel
    '364234',  // Mountains
    '220381',  // Hiking / Adventure
    '433251'   // Outdoor
  ];

  const uniqueIds = new Set();
  
  // Also add our existing 138 unique IDs so we don't lose them!
  const existing = [
    '1464822759023', '1454496522488', '1548318281', '1585016495481', '1582201942988',
    '1605649487212', '1544735716', '1501555088652', '1533240332313', '1519681393784',
    '1486873249358', '1465146344425', '1502086223501', '1549880338', '1506744038136',
    '1527661591475', '1500530855697', '1501854140801', '1469474968028', '1542224566',
    '1551632811', '1473448912268', '1441974231531', '1511497584788', '1447752875215',
    '1472214222541', '1513836279014', '1433832597046', '1470246973918', '1475924156734',
    '1507525428034', '1502082553048', '1510784722466', '1448375240586', '1505245208761',
    '1550236520', '1547036967', '1563841930', '1569115165842', '1570779374182',
    '1504280390367', '1518156677180', '1508739773434', '1494783367193', '1495107334309',
    '1513326738677', '1523496922380', '1503260511104', '1536900900010', '1487730116645',
    '1530541930197', '1525186402429', '1546811750', '1532274402911', '1426604966848',
    '1511300636408', '1528164344705', '1523987355523', '1501594907352', '1522163182402',
    '1506318137071', '1526481280693', '1416339684178', '1517824806704', '1483728642387',
    '1530866495561', '1471189641895', '1504609773096', '1518173946687', '1519331379826',
    '1455587734955', '1521330784833', '1484821582734', '1516690561799', '1470770841072',
    '1510312305653', '1470240731273', '1478562853135', '1470229722913', '1537210249814',
    '1485965120184', '1501785888041', '1627894483216', '1526761122248', '1518495973542',
    '1533727937480', '1470071459604', '1500382017468', '1490730141103', '1520111007886',
    '1561731216', '1547471080', '1534447677768', '1504380819583', '1516426122078',
    '1475113548554', '1481821582734', '1480044965905'
  ];

  for (const item of existing) {
    uniqueIds.add(item);
  }

  for (const cid of collectionIds) {
    try {
      console.log(`Fetching collection ${cid}...`);
      const html = await fetchCollection(cid);
      
      // Unsplash images in HTML typically have src like:
      // "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb..."
      // Let's match the "photo-1507525428034-b723cf961d3e" pattern
      // Broad regex: photo-\d{10,13}-[a-f0-9]{12} or simply photo-\d+-[a-zA-Z0-9]+
      const matches = html.matchAll(/photo-([0-9]{10,13})-([a-zA-Z0-9]{10,15})/g);
      for (const m of matches) {
        const fullId = `photo-${m[1]}-${m[2]}`;
        uniqueIds.add(fullId);
      }

      // Also let's try matching general source-like patterns: "images.unsplash.com/photo-1234567890-abcdef"
      const urlMatches = html.matchAll(/images\.unsplash\.com\/([a-zA-Z0-9_-]+)/g);
      for (const m of urlMatches) {
        if (m[1].startsWith('photo-')) {
          uniqueIds.add(m[1]);
        }
      }
    } catch (err) {
      console.error(`Error fetching collection ${cid}:`, err.message);
    }
  }

  console.log(`Collected ${uniqueIds.size} unique IDs.`);
  console.log(JSON.stringify(Array.from(uniqueIds), null, 2));
}

main();
