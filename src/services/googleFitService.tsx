export type StepData = {
  date: string;
  steps: number;
};

type Bucket = {
  startTimeMillis: string;
  endTimeMillis: string;
  dataset: {
    dataSourceId: string;
    point: Point[];
  }[];
};

type Point = {
  startTimeNanos: string;
  endTimeNanos: string;
  dataTypeName: string;
  originDataSourceId: string;
  value: [
    {
      intVal: number;
      mapVal: [];
    },
  ];
};

export const fetchMonthlySteps = async (): Promise<StepData[]> => {
  const token = localStorage.getItem("googleFitToken");

  if (!token) {
    throw new Error("no Google Fit token");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startTimeMillis = startOfMonth.getTime();
  const endTimeMillis = endOfMonth.getTime();

  const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      }],
      bucketByTime: { durationMillis: 86400000 }, // group by day (86400000 ms = 1 day)
      startTimeMillis,
      endTimeMillis,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`error fetching steps: ${errorData.error?.message ?? response.statusText}`);
  }

  const data = await response.json();
  console.log(data);
  const dailySteps: StepData[] = [];

  data.bucket.forEach((bucket: Bucket) => {
    try {
      const startTimeMs = parseInt(bucket.startTimeMillis, 10);
      if (isNaN(startTimeMs)) {
        console.warn("incorrect timestamp format error", bucket.startTimeMillis);
        return;
      }

      const bucketDate = new Date(startTimeMs);
      if (isNaN(bucketDate.getTime())) {
        console.warn("incorrect date from timestamp", startTimeMs);
        return;
      }

      const year = bucketDate.getFullYear();
      const month = String(bucketDate.getMonth() + 1).padStart(2, "0");
      const day = String(bucketDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      let steps = 0;
      if (bucket.dataset && bucket.dataset.length > 0) {
        const stepDataSet = bucket.dataset[0];

        if (stepDataSet.point && stepDataSet.point.length > 0) {
          stepDataSet.point.forEach((point: Point) => {
            if (point.value && point.value.length > 0) {
              steps += point.value[0].intVal || 0;
            }
          });
        }
      }

      dailySteps.push({
        date: dateString,
        steps,
      });
    } catch (err) {
      console.error("processing bucket data error", err);
    }
  });

  dailySteps.sort((a, b) => a.date.localeCompare(b.date));

  return dailySteps;
};
