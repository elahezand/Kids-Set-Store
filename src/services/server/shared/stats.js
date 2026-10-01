
function getStartOfToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function buildDayBuckets(days) {
  const buckets = [];
  const start = getStartOfToday();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.push(d.toISOString().slice(0, 10));
  }
  return buckets;
}

async function countByDay(Model, days, extraMatch = {}, dateField = "createdAt") {
  const since = new Date(getStartOfToday());
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const rows = await Model.aggregate([
    { $match: { ...extraMatch, [dateField]: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(rows.map((r) => [r._id, r.count]));
  return buildDayBuckets(days).map((day) => ({ day, count: map.get(day) || 0 }));
}

module.exports = {
  buildDayBuckets,
  countByDay,
};
