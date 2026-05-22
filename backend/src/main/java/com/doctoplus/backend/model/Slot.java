package com.doctoplus.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "slots")
@CompoundIndex(name = "pro_date_time_idx",
        def = "{'pro': 1, 'date': 1, 'startTime': 1}", unique = true)
public class Slot {

    @Id
    private String id;

    private String pro;       // Professional ID
    private String date;      // YYYY-MM-DD
    private String startTime; // HH:MM
    private String endTime;   // HH:MM
    private boolean isBooked = false;

    public Slot() {}

    public Slot(String pro, String date, String startTime, String endTime) {
        this.pro = pro;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = false;
    }

    /**
     * Expose as "_id" so React (slot._id) and Flutter (json['_id']) both resolve.
     */
    @JsonProperty("_id")
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPro() { return pro; }
    public void setPro(String pro) { this.pro = pro; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    /**
     * Jackson strips "is" prefix by default → sends "booked" not "isBooked".
     * Both React and Flutter expect "isBooked", so we fix it here.
     */
    @JsonProperty("isBooked")
    public boolean isBooked() { return isBooked; }
    public void setBooked(boolean booked) { isBooked = booked; }
}
