import { describe, it, expect } from "vitest";
import { getAllCourses, getCourseById } from "@/lib/courses";

describe("courses", () => {
  const courses = getAllCourses();

  it("returns an array of courses", () => {
    expect(Array.isArray(courses)).toBe(true);
  });

  it("has at least one course", () => {
    expect(courses.length).toBeGreaterThan(0);
  });

  it("every course has required fields", () => {
    for (const course of courses) {
      expect(course.id).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(typeof course.priceILS).toBe("number");
      expect(course.category).toBeTruthy();
      expect(course.semester).toBeTruthy();
      expect(typeof course.year).toBe("number");
    }
  });

  it("courses with units have valid units array", () => {
    const withUnits = courses.filter((c) => c.units.length > 0);
    expect(withUnits.length).toBeGreaterThan(0);
    for (const course of withUnits) {
      expect(Array.isArray(course.units)).toBe(true);
    }
  });

  it("every unit has id, slug, title, and file", () => {
    for (const course of courses) {
      for (const unit of course.units) {
        expect(typeof unit.id).toBe("number");
        expect(unit.slug).toBeTruthy();
        expect(unit.title).toBeTruthy();
        expect(unit.file).toBeTruthy();
      }
    }
  });

  it("getCourseById returns correct course", () => {
    const first = courses[0];
    const found = getCourseById(first.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(first.id);
  });

  it("getCourseById returns null for unknown id", () => {
    expect(getCourseById("nonexistent-course-xyz")).toBeNull();
  });

  it("course IDs are unique", () => {
    const ids = courses.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
